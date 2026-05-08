import apiClient from "@/lib/api-client";
import { Product, PaginatedResponse } from "@/types/product";

export const catalogService = {
  getProducts: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Product>>("/products", {
      params: { page, limit },
    });
    return response.data;
  },

  getProductBySlug: async (slug: string) => {
    const response = await apiClient.get<Product>(`/products/${slug}`);
    return response.data;
  },
};
