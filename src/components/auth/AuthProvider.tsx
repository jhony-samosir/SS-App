"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { authService } from "@/services/auth-service";
import { useQuery } from "@tanstack/react-query";

/**
 * Enterprise Auth Provider
 * 
 * Responsibilities:
 * 1. Bootstrap the session on app load (Sync Store with Cookies/JWT).
 * 2. Handle silent refresh if the access token is missing from memory.
 */
export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { 
    setAuth,
    setInitialized, 
    isAuthenticated,
    isHydrated 
  } = useAuthStore();

  // 1. Initial Bootstrap: The api-client interceptor will handle silent refresh 
  // automatically when getCurrentUser() below returns a 401. 
  // We just need to ensure the query is enabled when hydrated.
  
  // 2. Fetch current user on app start to bootstrap session if not already provided by server
  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => authService.getCurrentUser(),
    retry: (failureCount, error) => {
      // Don't retry on 401 as the interceptor will handle token rotation
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Only fetch if we are hydrated but NOT authenticated yet
    enabled: isHydrated && !isAuthenticated, 
  });

  useEffect(() => {
    // If already authenticated by server hydration, we are done
    if (isHydrated && isAuthenticated) {
      setInitialized(true);
      return;
    }

    // If the bootstrap query has finished, we mark initialization as complete.
    if (!isLoading && isHydrated) {
      if (isSuccess && data?.user) {
        setAuth(data.user);
      }
      setInitialized(true);
    }
  }, [data, isSuccess, isError, isLoading, setAuth, setInitialized, isHydrated, isAuthenticated]);

  return <>{children}</>;
}
