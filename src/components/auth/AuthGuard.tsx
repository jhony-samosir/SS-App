"use client";

import { useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/use-auth-store";
import { GuardFallback } from "./guards/GuardFallback";

function AuthGuardContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect if initialization is complete and user is not authenticated
    if (isInitialized && !isAuthenticated) {
      const params = new URLSearchParams(searchParams.toString());
      const currentPath = pathname + (params.toString() ? `?${params.toString()}` : "");
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isInitialized, router, pathname, searchParams]);

  // While initializing, show a loading state to prevent "premature redirect" race conditions
  if (!isInitialized) {
    return <GuardFallback message="Checking access..." />;
  }

  // If not authenticated after initialization, don't render children (redirect will trigger)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<GuardFallback message="Checking access..." />}>
      <AuthGuardContent>{children}</AuthGuardContent>
    </Suspense>
  );
}
