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
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string;
  name: string;
  is_default: boolean;
  weight_gram?: number;
  price?: number;
  attributes?: VariantAttributeValue[];
  inventory?: ProductInventory[];
}

export interface VariantAttributeValue {
  attribute_id: string;
  attribute_value_id: string;
  attribute_name: string;
  value: string;
}

export interface ProductInventory {
  id: string;
  variant_id: string;
  warehouse_id: string;
  warehouse_name?: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  low_stock_alert: number;
}

export interface ProductReview {
  ID: number;
  ProductID: number;
  UserID: string;
  UserName: string;
  Rating: number;
  Comment: string;
  Status: "pending" | "approved" | "rejected";
  CreatedAt: string;
}

export interface PaginatedResponse<T> {
  status: number;
  message: string;
  data: {
    items: T[];
    total_count: number;
    page: number;
    limit: number;
  };
}
