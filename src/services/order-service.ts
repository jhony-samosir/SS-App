import apiClient from "@/lib/api-client";

export interface OrderItem {
  productId: number;
  productPublicId: string;
  productName: string;
  variantId?: number;
  variantPublicId?: string;
  variantName?: string;
  sku?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderAddress {
  type: string;
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface Order {
  id: number;
  publicId: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  currencyCode: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  shippingCourier: string;
  shippingService: string;
  shippingTrackingNumber?: string;
  notes?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  shippingAddress?: OrderAddress;
}

export const orderService = {
  getOrders: async () => {
    const response = await apiClient.get<Order[]>("/api/orders");
    return response.data;
  },

  getOrder: async (publicId: string) => {
    const response = await apiClient.get<Order>(`/api/orders/${publicId}`);
    return response.data;
  }
};
