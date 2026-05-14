import { Category } from "./catalog";

export interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  image_url: string;
  rating: number;
  description?: string;
  brand_id?: number;
  categories?: Category[];
}

export interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  offset: number;
}
