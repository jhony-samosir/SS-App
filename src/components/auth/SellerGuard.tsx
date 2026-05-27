"use client";

import { useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { GuardFallback } from "./guards/GuardFallback";

function SellerGuardContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, isInitialized, isHydrated, hasRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isInitialized && isHydrated) {
      if (!isAuthenticated) {
        const params = new URLSearchParams(searchParams.toString());
        const currentPath = pathname + (params.toString() ? `?${params.toString()}` : "");
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      } else if (!hasRole("Seller")) {
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isInitialized, isHydrated, hasRole, router, pathname, searchParams]);

  if (!isInitialized || !isHydrated) {
    return <GuardFallback message="Verifying seller access..." />;
  }

  if (!isAuthenticated || !hasRole("Seller")) {
    return null;
  }

  return <>{children}</>;
}

export function SellerGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<GuardFallback message="Verifying seller access..." />}>
      <SellerGuardContent>{children}</SellerGuardContent>
    </Suspense>
  );
}
