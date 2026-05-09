"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect away if initialization is complete and user is already authenticated
    if (isInitialized && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  // While initializing, return null to avoid flashing guest content for authenticated users
  if (!isInitialized) {
    return null; 
  }

  // If already authenticated after initialization, don't render children (redirect will trigger)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
