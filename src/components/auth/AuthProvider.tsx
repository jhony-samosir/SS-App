"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { authService } from "@/services/auth-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Enterprise Auth Provider
 * 
 * Responsibilities:
 * 1. Bootstrap the session on app load (Sync Store with Cookies/JWT).
 * 2. Handle silent refresh if the access token is missing from memory.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { 
    setAuth, 
    setAccessToken, 
    setInitialized, 
    isAuthenticated, 
    accessToken,
    isHydrated 
  } = useAuthStore();
  const queryClient = useQueryClient();
  const refreshStarted = useRef(false);

  // 1. Initial Bootstrap: The api-client interceptor will handle silent refresh 
  // automatically when getCurrentUser() below returns a 401. 
  // We just need to ensure the query is enabled when hydrated.
  
  // 2. Fetch current user on app start to bootstrap session
  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => authService.getCurrentUser(),
    retry: (failureCount, error: any) => {
      // Don't retry on 401 as the interceptor will handle token rotation
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isHydrated, // Always attempt to fetch current user on hydration to bootstrap session from cookies
  });

  useEffect(() => {
    if (isSuccess && data?.user) {
      setAuth(data.user);
      setInitialized(true);
    } else if (isError || (!isLoading && !data && isHydrated)) {
      setInitialized(true);
    }
  }, [data, isSuccess, isError, isLoading, setAuth, setInitialized, isHydrated]);

  return <>{children}</>;
}
