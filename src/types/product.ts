export interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  image_url: string;
  rating: number;
  brand_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  offset: number;
}
