"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { motion } from "framer-motion";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if initialization is complete and user is not authenticated
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  // While initializing, show a loading state to prevent "premature redirect" race conditions
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Checking access...</p>
      </div>
    );
  }

  // If not authenticated after initialization, don't render children (redirect will trigger)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
