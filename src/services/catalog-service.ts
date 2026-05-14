import apiClient from "@/lib/api-client";
import { Product } from "@/types/product";
import { Brand, Category, ProductAttribute, Tag, Warehouse, PaginatedResponse } from "@/types/catalog";

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

export const catalogService = {
  // --- Products ---
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

  // --- Categories ---
  getCategories: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<Category>>("/api/catalog/v1/categories", {
      params,
    });
    return response.data;
  },

  createCategory: async (data: Partial<Category>) => {
    const response = await apiClient.post<{ data: Category }>("/api/catalog/v1/categories", data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    const response = await apiClient.put<{ data: Category }>(`/api/catalog/v1/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/categories/${id}`);
  },

  // --- Brands ---
  getBrands: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<Brand>>("/api/catalog/v1/brands", {
      params,
    });
    return response.data;
  },

  createBrand: async (data: Partial<Brand>) => {
    const response = await apiClient.post<{ data: Brand }>("/api/catalog/v1/brands", data);
    return response.data;
  },

  updateBrand: async (id: string, data: Partial<Brand>) => {
    const response = await apiClient.put<{ data: Brand }>(`/api/catalog/v1/brands/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/brands/${id}`);
  },

  // --- Attributes ---
  getAttributes: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<ProductAttribute>>("/api/catalog/v1/attributes", {
      params,
    });
    return response.data;
  },

  createAttribute: async (data: Partial<ProductAttribute>) => {
    const response = await apiClient.post<{ data: ProductAttribute }>("/api/catalog/v1/attributes", data);
    return response.data;
  },

  updateAttribute: async (id: string, data: Partial<ProductAttribute>) => {
    const response = await apiClient.put<{ data: ProductAttribute }>(`/api/catalog/v1/attributes/${id}`, data);
    return response.data;
  },

  deleteAttribute: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/attributes/${id}`);
  },

  // --- Tags ---
  getTags: async () => {
    const response = await apiClient.get<{ data: Tag[] }>("/api/catalog/v1/tags");
    return response.data;
  },

  createTag: async (data: Partial<Tag>) => {
    const response = await apiClient.post<{ data: Tag }>("/api/catalog/v1/tags", data);
    return response.data;
  },

  deleteTag: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/tags/${id}`);
  },

  // --- Warehouses ---
  getWarehouses: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<Warehouse>>("/api/catalog/v1/warehouses", {
      params,
    });
    return response.data;
  },

  createWarehouse: async (data: Partial<Warehouse>) => {
    const response = await apiClient.post<{ data: Warehouse }>("/api/catalog/v1/warehouses", data);
    return response.data;
  },

  updateWarehouse: async (id: string, data: Partial<Warehouse>) => {
    const response = await apiClient.put<{ data: Warehouse }>(`/api/catalog/v1/warehouses/${id}`, data);
    return response.data;
  },

  deleteWarehouse: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/warehouses/${id}`);
  },

  // --- Reviews ---
  getReviews: async (productId: string, params: { limit?: number; offset?: number } = {}) => {
    const response = await apiClient.get<{ data: any[] }>(`/api/catalog/v1/reviews/product/${productId}`, {
      params,
    });
    return response.data;
  },

  getRatingSummary: async (productId: string) => {
    const response = await apiClient.get<{ average_rating: number; total_reviews: number }>(`/api/catalog/v1/reviews/product/${productId}/summary`);
    return response.data;
  },

  submitReview: async (payload: { product_id: string; rating: number; comment: string; user_name: string }) => {
    const response = await apiClient.post("/api/catalog/v1/reviews", payload);
    return response.data;
  },
};
