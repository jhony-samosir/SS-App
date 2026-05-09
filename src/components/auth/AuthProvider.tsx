"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { authService } from "@/services/auth-service";
import { useQuery } from "@tanstack/react-query";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setInitialized } = useAuthStore();

  // Fetch current user on app start to bootstrap session
  // Silent background fetch to avoid blocking public pages
  const { data, isSuccess, isError, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess && data?.user) {
      setAuth(data.user);
      setInitialized(true);
    } else if (isError || (!isLoading && !data)) {
      // If error or finished loading without data, we're initialized but unauthenticated
      // (interceptor handles logout on 401)
      setInitialized(true);
    }
  }, [data, isSuccess, isError, isLoading, setAuth, setInitialized]);

  return <>{children}</>;
}
