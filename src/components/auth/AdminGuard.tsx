"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { ADMIN_PERMISSIONS } from "@/lib/constants";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, hasAnyPermission } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!hasAnyPermission(ADMIN_PERMISSIONS)) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isInitialized, hasAnyPermission, router]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Verifying administrative access...</p>
      </div>
    );
  }

  if (!isAuthenticated || !hasAnyPermission(ADMIN_PERMISSIONS)) {
    return null;
  }

  return <>{children}</>;
}
