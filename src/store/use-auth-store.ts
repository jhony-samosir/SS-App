import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  mfaToken: string | null;
  isMfaRequired: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken?: string) => void;
  setAccessToken: (token: string) => void; // New action for refreshing
  setInitialized: (val: boolean) => void;
  setHydrated: (val: boolean) => void;
  setAuthenticated: (val: boolean) => void;
  setMfaChallenge: (token: string) => void;
  clearMfaChallenge: () => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,
      mfaToken: null,
      isMfaRequired: false,
      isHydrated: false,
      setAuth: (user, accessToken) => {
        set({ 
          user, 
          accessToken: accessToken || get().accessToken, 
          isAuthenticated: true, 
          isMfaRequired: false, 
          mfaToken: null 
        });
      },
      setAccessToken: (accessToken) => {
        set({ accessToken, isAuthenticated: true });
      },
      setInitialized: (val) => {
        set({ isInitialized: val });
      },
      setHydrated: (val) => {
        set({ isHydrated: val });
      },
      setAuthenticated: (val) => {
        set({ isAuthenticated: val });
      },
      setMfaChallenge: (token) => {
        set({ mfaToken: token, isMfaRequired: true, isAuthenticated: false });
      },
      clearMfaChallenge: () => {
        set({ mfaToken: null, isMfaRequired: false });
      },
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false, mfaToken: null, isMfaRequired: false });
      },
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission) || user.permissions.includes("*");
      },
      hasAnyPermission: (permissions) => {
        const { user } = get();
        if (!user) return false;
        if (user.permissions.includes("*")) return true;
        return permissions.some(p => user.permissions.includes(p));
      },
      hasRole: (role) => {
        const { user } = get();
        return user?.roleName === role;
      },
      hasAnyRole: (roles) => {
        const { user } = get();
        return user ? roles.includes(user.roleName) : false;
      },
    }),
    {
      name: "auth-storage",
      // Security Hardening: Only persist non-sensitive UI state.
      // accessToken and isAuthenticated are NOT persisted.
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          // If we have a user from storage, assume we should attempt to bootstrap the session
          if (state.user) {
            state.setAuthenticated(true);
          }
        }
      },
    }
  )
);
