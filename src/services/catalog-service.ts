import apiClient from "@/lib/api-client";
import { Product, ProductVariant, ProductInventory } from "@/types/product";
import { Brand, Category, ProductAttribute, Tag, Warehouse, PaginatedResponse, ProductBundle, ImportJob } from "@/types/catalog";

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

const API_BASE = "/api/catalog/v1";

const handleApiError = (error: any, defaultMessage: string) => {
  const message = error.response?.data?.error || error.message || defaultMessage;
  throw new Error(message);
};

export const catalogService = {
  // --- Products ---
  getProducts: async (params: SearchParams = {}) => {
    const response = await apiClient.get<SearchResponse>("/api/catalog/v1/products/search", {
      params,
    });
    return response.data;
  },

  getAdminProducts: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<Product>>("/api/catalog/v1/products", {
      params,
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await apiClient.get<Product>(`/api/catalog/v1/products/${id}`);
    return response.data;
  },

  createProduct: async (data: Partial<Product>) => {
    const response = await apiClient.post<{ data: Product }>("/api/catalog/v1/products", data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    const response = await apiClient.put<{ data: Product }>(`/api/catalog/v1/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/products/${id}`);
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
  getTags: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<Tag>>("/api/catalog/v1/tags", {
      params,
    });
    return response.data;
  },

  createTag: async (data: Partial<Tag>) => {
    const response = await apiClient.post<{ data: Tag }>("/api/catalog/v1/tags", data);
    return response.data;
  },

  updateTag: async (id: string, data: Partial<Tag>) => {
    const response = await apiClient.put<{ data: Tag }>(`/api/catalog/v1/tags/${id}`, data);
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

  getAllReviews: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<any>>("/api/catalog/v1/reviews", {
      params,
    });
    return response.data;
  },

  updateReviewStatus: async (id: string, status: "approved" | "rejected" | "pending") => {
    const response = await apiClient.patch(`/api/catalog/v1/reviews/${id}/status`, { status });
    return response.data;
  },

  submitReview: async (payload: { product_id: string; rating: number; comment: string; user_name: string }) => {
    const response = await apiClient.post("/api/catalog/v1/reviews", payload);
    return response.data;
  },

  // --- Bundles ---
  getBundles: async (params: { limit?: number; offset?: number } = {}) => {
    try {
      const response = await apiClient.get<PaginatedResponse<ProductBundle>>(`${API_BASE}/bundles`, { params });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch bundles");
    }
  },

  getBundle: async (id: string) => {
    try {
      const response = await apiClient.get<{ data: ProductBundle }>(`${API_BASE}/bundles/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch bundle details");
    }
  },

  createBundle: async (payload: Partial<ProductBundle>) => {
    try {
      const response = await apiClient.post<{ message: string }>(`${API_BASE}/bundles`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to create bundle");
    }
  },

  updateBundle: async (id: string, payload: Partial<ProductBundle>) => {
    try {
      const response = await apiClient.put<{ message: string }>(`${API_BASE}/bundles/${id}`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to update bundle");
    }
  },

  deleteBundle: async (id: number) => {
    try {
      const response = await apiClient.delete<{ message: string }>(`${API_BASE}/bundles/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to delete bundle");
    }
  },

  // --- Imports ---
  getImportJobs: async (params: { page?: number; limit?: number } = {}) => {
    try {
      const response = await apiClient.get<PaginatedResponse<ImportJob>>(`${API_BASE}/imports`, { params });
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch import history");
    }
  },

  triggerImport: async (payload: { file_url: string; job_type: string }) => {
    try {
      const response = await apiClient.post<{ message: string; job_id: string }>(`${API_BASE}/imports`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to trigger import process");
    }
  },

  // --- Variants ---
  getVariants: async (productId: string) => {
    const response = await apiClient.get<{ data: ProductVariant[] }>(`/api/catalog/v1/products/${productId}/variants`);
    return response.data;
  },

  createVariant: async (productId: string, data: Partial<ProductVariant>) => {
    const response = await apiClient.post<{ data: ProductVariant }>(`/api/catalog/v1/products/${productId}/variants`, data);
    return response.data;
  },

  updateVariant: async (id: string, data: Partial<ProductVariant>) => {
    const response = await apiClient.put<{ data: ProductVariant }>(`/api/catalog/v1/variants/${id}`, data);
    return response.data;
  },

  deleteVariant: async (id: string) => {
    await apiClient.delete(`/api/catalog/v1/variants/${id}`);
  },

  // --- Inventory ---
  getInventory: async (params: { warehouse_id?: string; variant_id?: string; page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<PaginatedResponse<ProductInventory>>("/api/catalog/v1/inventory", {
      params,
    });
    return response.data;
  },

  updateStock: async (data: { variant_id: string; warehouse_id: string; quantity: number; note?: string; reference_type?: string; reference_id?: string }) => {
    const response = await apiClient.post("/api/catalog/v1/inventory/stock-update", data);
    return response.data;
  },
};
