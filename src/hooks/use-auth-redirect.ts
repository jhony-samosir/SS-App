"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
  permissions: string[];
}

/**
 * Custom Hook to handle post-login/post-MFA redirection logic.
 * 
 * Supports persona-based routing (Admin vs Customer) and 
 * deep-linking via returnUrl query parameter.
 */
export function useAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  /**
   * Security Best Practice: Mitigate Open Redirect Vulnerability
   * Ensures that the returnUrl is a safe, local relative path.
   */
  const isSafeUrl = (url: string): boolean => {
    return url.startsWith("/") && !url.startsWith("//");
  };

  const resolveRedirectPath = useCallback((user: User): string => {
    // 1. If there's a safe returnUrl, prioritize it
    if (returnUrl && isSafeUrl(returnUrl)) {
      return returnUrl;
    }

    // 2. Check for Admin persona
    const isAdmin = user.permissions.some(p => 
      p === "*" || 
      p === "RoleManagement" || 
      p === "MenuManagement" || 
      p.startsWith("UserManagement")
    );

    if (isAdmin) {
      return "/admin";
    }

    // 3. Default to Storefront Home for customers
    return "/";
  }, [returnUrl]);

  const handlePostLoginRedirect = useCallback((user: User) => {
    const path = resolveRedirectPath(user);
    router.push(path);
    // Performance Best Practice: Remove redundant router.refresh() 
    // unless explicit server-side state sync is required.
  }, [resolveRedirectPath, router]);

  return {
    handlePostLoginRedirect,
    resolveRedirectPath,
    returnUrl
  };
}
