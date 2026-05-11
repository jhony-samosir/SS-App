"use client";

import { useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { ADMIN_PERMISSIONS } from "@/lib/constants";
import { GuardFallback } from "./guards/GuardFallback";

function AdminGuardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, isHydrated, hasAnyPermission } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isInitialized && isHydrated) {
      if (!isAuthenticated) {
        const params = new URLSearchParams(searchParams.toString());
        const currentPath = pathname + (params.toString() ? `?${params.toString()}` : "");
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      } else if (!hasAnyPermission(ADMIN_PERMISSIONS)) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isInitialized, isHydrated, hasAnyPermission, router, pathname, searchParams]);

  if (!isInitialized || !isHydrated) {
    return <GuardFallback message="Verifying administrative access..." />;
  }

  if (!isAuthenticated || !hasAnyPermission(ADMIN_PERMISSIONS)) {
    return null;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<GuardFallback message="Verifying administrative access..." />}>
      <AdminGuardContent>{children}</AdminGuardContent>
    </Suspense>
  );
}
