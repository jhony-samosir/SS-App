"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";

interface RoleGuardProps {
  children: React.ReactNode;
  /** Single role required (e.g. "Admin") */
  role?: string;
  /** List of allowed roles */
  roles?: string[];
  /** Optional fallback UI to show if user lacks role */
  fallback?: React.ReactNode;
  /** Optional UI to show during client-side hydration to prevent layout shift */
  loadingFallback?: React.ReactNode;
}

/**
 * Reusable Role Guard Component
 * 
 * Conditionally renders children based on the user's assigned role.
 * 
 * @guidance
 * **Standard Tim (Convention)**: Gunakan RoleGuard hanya untuk perubahan kosmetik 
 * khusus role (misal: label badge). Untuk kontrol akses fungsional, 
 * gunakan PermissionGuard (PBAC).
 * 
 * @security
 * **WARNING**: Komponen ini hanya menyembunyikan elemen UI di sisi client. 
 * Validasi otorisasi tetat WAJIB dilakukan di sisi API Gateway/Backend untuk setiap aksi.
 */
export function RoleGuard({
  children,
  role,
  roles,
  fallback = null,
  loadingFallback = null,
}: RoleGuardProps) {
  const { user, isHydrated } = useAuth();

  // Handle hydration to prevent flash of unauthorized state and layout shift
  if (!isHydrated) return <>{loadingFallback}</>;

  const allowedRoles = roles || (role ? [role] : []);
  
  // If no roles are specified, allow by default
  if (allowedRoles.length === 0) return <>{children}</>;

  // Use roleName for consistency with backend UserProfile
  const hasAccess = user && allowedRoles.includes(user.roleName);

  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}
