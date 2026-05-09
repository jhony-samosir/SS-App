import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "auth-storage",
      // Only persist user and auth status, not initialization or MFA tokens
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
