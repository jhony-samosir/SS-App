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

  // 1. Silent Refresh Logic: If we are "authenticated" but have no token (e.g. page refresh)
  useEffect(() => {
    async function performSilentRefresh() {
      // Wait for hydration before deciding if we need refresh
      if (isHydrated && isAuthenticated && !accessToken && !refreshStarted.current) {
        refreshStarted.current = true;
        try {
          const { accessToken: newToken } = await authService.refresh();
          setAccessToken(newToken);
          // Refetch user profile after successful refresh to ensure state is in sync
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
        } catch (error) {
          console.error("Silent refresh failed during initialization:", error);
          // logout() will be called by interceptor if refresh returns 401
        }
      }
    }
    performSilentRefresh();
  }, [isAuthenticated, accessToken, setAccessToken, queryClient, isHydrated]);

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
    enabled: isHydrated && (!!accessToken || isAuthenticated), // Only fetch if hydrated AND we have a token or think we are logged in
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
