"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/use-auth-store";

interface StoreHydratorProps {
  user: any;
}

/**
 * StoreHydrator
 * 
 * Synchronizes the server-side session into the client-side Zustand store.
 * This runs before any other client-side logic, ensuring a flicker-free UI.
 */
export function StoreHydrator({ user }: StoreHydratorProps) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  
  // We use a ref to ensure hydration only happens once
  const isHydrated = useRef(false);

  if (!isHydrated.current) {
    if (user) {
      // In-memory update before render
      useAuthStore.setState({ 
        user, 
        isAuthenticated: true, 
        isHydrated: true,
        isInitialized: true 
      });
    } else {
      useAuthStore.setState({ 
        isHydrated: true 
      });
    }
    isHydrated.current = true;
  }

  return null;
}
