import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isAdminSidebarCollapsed: boolean;
  isSellerSidebarCollapsed: boolean;
  toggleAdminSidebar: () => void;
  toggleSellerSidebar: () => void;
  setAdminSidebarCollapsed: (val: boolean) => void;
}

/**
 * UI State Store
 * 
 * Manages UI-specific states like sidebar collapse, theme preferences, etc.
 * Uses persistence to remember user preferences.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isAdminSidebarCollapsed: false,
      isSellerSidebarCollapsed: false,
      toggleAdminSidebar: () => set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
      toggleSellerSidebar: () => set((state) => ({ isSellerSidebarCollapsed: !state.isSellerSidebarCollapsed })),
      setAdminSidebarCollapsed: (val) => set({ isAdminSidebarCollapsed: val }),
    }),
    {
      name: "ui-storage",
    }
  )
);
