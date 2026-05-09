import apiClient from "@/lib/api-client";
import { Product, PaginatedResponse } from "@/types/product";

export interface SearchParams {
  q?: string;
  category_slug?: string;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  limit?: number;
  cursor?: string;
}

export interface SearchResponse {
  data: Product[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string;
  description: string;
}

export const catalogService = {
  getProducts: async (params: SearchParams = {}) => {
    const response = await apiClient.get<SearchResponse>("/api/catalog/v1/products/search", {
      params,
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<Product>(`/api/catalog/v1/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get<{ data: Category[] }>("/api/catalog/v1/categories");
    return response.data;
  },
};
