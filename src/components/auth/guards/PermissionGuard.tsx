"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Single permission required (e.g. "UserManagement:Read") */
  permission?: string;
  /** List of permissions required */
  permissions?: string[];
  /** Whether all permissions are required (AND) or just one (OR). Defaults to false (OR). */
  requireAll?: boolean;
  /** Optional fallback UI to show if user lacks permission */
  fallback?: React.ReactNode;
  /** Optional UI to show during client-side hydration to prevent layout shift */
  loadingFallback?: React.ReactNode;
}

/**
 * Reusable Permission Guard Component
 * 
 * Conditionally renders children based on the user's permissions.
 * Supports wildcards if implemented in the auth store.
 * 
 * @example
 * <PermissionGuard permission="MenuManagement" loadingFallback={<Skeleton />}>
 *   <MenuEditor />
 * </PermissionGuard>
 * 
 * @guidance
 * **Standard Tim (Convention)**: Selalu prioritaskan penggunaan PermissionGuard (PBAC) 
 * di atas RoleGuard untuk fleksibilitas akses kontrol yang lebih baik.
 * 
 * @security
 * **WARNING**: Komponen ini hanya menyembunyikan elemen UI di sisi client. 
 * Validasi otorisasi tetat WAJIB dilakukan di sisi API Gateway/Backend untuk setiap aksi.
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  loadingFallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, isHydrated } = useAuth();

  // Handle hydration to prevent flash of unauthorized state and layout shift
  if (!isHydrated) return <>{loadingFallback}</>;

  const requiredList = permissions || (permission ? [permission] : []);
  
  // If no permissions are specified, allow by default
  if (requiredList.length === 0) return <>{children}</>;

  const hasAccess = requireAll
    ? requiredList.every((p) => hasPermission(p))
    : hasAnyPermission(requiredList);

  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}
