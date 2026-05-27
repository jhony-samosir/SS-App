"use client";

import { useRef } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import type { User } from "@/store/use-auth-store";

interface StoreHydratorProps {
  user: User | null;
}

/**
 * StoreHydrator
 * 
 * Synchronizes the server-side session into the client-side Zustand store.
 * This runs before any other client-side logic, ensuring a flicker-free UI.
 */
export function StoreHydrator({ user }: StoreHydratorProps) {
  
  // We use a ref to ensure hydration only happens once
  const isHydrated = useRef<boolean | null>(null);

  if (isHydrated.current == null) {
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
