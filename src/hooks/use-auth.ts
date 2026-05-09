import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Custom Hook for Hydration-Safe Auth Access
 * 
 * Prevents Next.js Hydration Mismatch errors by ensuring that 
 * persisted store state is only accessed after client-side mounting.
 */
export function useAuth() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const auth = useAuthStore();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) {
    return {
      user: null,
      isAuthenticated: false,
      mfaToken: null,
      isMfaRequired: false,
      setAuth: auth.setAuth,
      setMfaChallenge: auth.setMfaChallenge,
      clearMfaChallenge: auth.clearMfaChallenge,
      logout: auth.logout,
      isHydrated: false,
    };
  }

  return { ...auth, isHydrated: true };
}
