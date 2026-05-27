"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";

export function GuestGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect away if initialization is complete and user is already authenticated
    if (isInitialized && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  // While initializing, show a subtle loader to prevent flash of empty content
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If already authenticated after initialization, don't render children (redirect will trigger)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
