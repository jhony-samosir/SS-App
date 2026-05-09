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
  mfaToken: string | null;
  isMfaRequired: boolean;
  setAuth: (user: User) => void;
  setMfaChallenge: (token: string) => void;
  clearMfaChallenge: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      mfaToken: null,
      isMfaRequired: false,
      setAuth: (user) => {
        set({ user, isAuthenticated: true, isMfaRequired: false, mfaToken: null });
      },
      setMfaChallenge: (token) => {
        set({ mfaToken: token, isMfaRequired: true, isAuthenticated: false });
      },
      clearMfaChallenge: () => {
        set({ mfaToken: null, isMfaRequired: false });
      },
      logout: () => {
        // Session cookie will be cleared by a dedicated API call to /api/auth/logout.
        // The apiClient response interceptor also calls this method on 401 errors
        // to keep the UI state in sync with the server session.
        set({ user: null, isAuthenticated: false, mfaToken: null, isMfaRequired: false });
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
