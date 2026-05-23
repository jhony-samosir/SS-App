import { create } from "zustand";
import { cartService, CartItem, AddCartItemPayload } from "@/services/cart-service";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (payload: AddCartItemPayload) => Promise<void>;
  updateItemQuantity: (publicId: string, quantity: number) => Promise<void>;
  removeItem: (publicId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
  
  // UI Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,
  isDrawerOpen: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await cartService.getCart();
      set({
        items: data.items || [],
        total: data.total || 0,
        itemCount: data.itemCount || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to load cart", isLoading: false });
    }
  },

  addItem: async (payload: AddCartItemPayload) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.addItem(payload);
      await get().fetchCart();
      set({ isDrawerOpen: true });
    } catch (err: any) {
      set({ error: err.message || "Failed to add item to cart", isLoading: false });
      // We might throw it further so components can show toasts
      throw err;
    }
  },

  updateItemQuantity: async (publicId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.updateItemQuantity(publicId, quantity);
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message || "Failed to update quantity", isLoading: false });
      throw err;
    }
  },

  removeItem: async (publicId: string) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.removeItem(publicId);
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.message || "Failed to remove item", isLoading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      set({ items: [], total: 0, itemCount: 0, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to clear cart", isLoading: false });
    }
  },

  checkout: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await cartService.checkout();
      if (res.success) {
        set({ items: [], total: 0, itemCount: 0, isLoading: false, isDrawerOpen: false });
        return { success: true, orderId: res.orderId };
      }
      return { success: false, error: "Checkout failed" };
    } catch (err: any) {
      const errorMsg = err.message || "Checkout failed due to insufficient stock or invalid cart";
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));
