import apiClient from "@/lib/api-client";

export interface CartItem {
  publicId: string;
  productId: number;
  productPublicId: string;
  variantId?: number;
  variantPublicId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  imageUrl?: string;
  unitPrice: number;
  currencyCode: string;
  quantity: number;
  subtotal: number;
  sellerId?: number;
  sellerName?: string;
}

export interface Cart {
  publicId: string;
  status: string;
  notes?: string;
}

export interface CartResponse {
  cart: Cart | null;
  items: CartItem[];
  total: number;
  itemCount: number;
  currencyCode: string;
}

export interface AddCartItemPayload {
  productId: number;
  productPublicId: string;
  variantId?: number;
  variantPublicId?: string;
  productName: string;
  variantName?: string;
  sku?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  sellerId?: number;
  sellerName?: string;
}

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get<{ data: CartResponse }>("/api/cart");
    return response.data.data;
  },

  addItem: async (payload: AddCartItemPayload) => {
    const response = await apiClient.post<{ data: { item: CartItem } }>("/api/cart/items", payload);
    return response.data.data;
  },

  updateItemQuantity: async (publicId: string, quantity: number) => {
    const response = await apiClient.put<{ data: { item: CartItem } }>(`/api/cart/items/${publicId}`, { quantity });
    return response.data.data;
  },

  removeItem: async (publicId: string) => {
    await apiClient.delete(`/api/cart/items/${publicId}`);
  },

  clearCart: async () => {
    await apiClient.delete("/api/cart");
  },

  checkout: async () => {
    const response = await apiClient.post<{ data: { success: boolean; orderId: string; totalAmount: number } }>("/api/cart/checkout");
    return response.data.data;
  }
};
