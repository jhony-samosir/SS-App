import apiClient from "@/lib/api-client";

export interface PaymentResponse {
  id: string;
  orderPublicId: string;
  userId: number;
  userPublicId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentReference?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  createdAt: string;
}

export const paymentService = {
  getPaymentByOrder: async (orderPublicId: string) => {
    const response = await apiClient.get<PaymentResponse>(`/api/payments/order/${orderPublicId}`);
    return response.data;
  }
};
