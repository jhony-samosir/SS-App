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
  isAuthenticated: boolean;
  isInitialized: boolean;
  mfaToken: string | null;
  isMfaRequired: boolean;
  setAuth: (user: User) => void;
  setInitialized: (val: boolean) => void;
  setMfaChallenge: (token: string) => void;
  clearMfaChallenge: () => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      mfaToken: null,
      isMfaRequired: false,
      setAuth: (user) => {
        set({ user, isAuthenticated: true, isMfaRequired: false, mfaToken: null });
      },
      setInitialized: (val) => {
        set({ isInitialized: val });
      },
      setMfaChallenge: (token) => {
        set({ mfaToken: token, isMfaRequired: true, isAuthenticated: false });
      },
      clearMfaChallenge: () => {
        set({ mfaToken: null, isMfaRequired: false });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, mfaToken: null, isMfaRequired: false });
      },
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        // Support specific permissions or wildcard access
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
