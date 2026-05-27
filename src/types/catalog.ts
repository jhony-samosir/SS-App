export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  is_active: boolean;
}

export interface Category extends BaseEntity {
  parent_id?: number | null;
  name: string;
  slug: string;
  icon_url?: string;
  description?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  children?: Category[];
}

export interface ProductAttribute extends BaseEntity {
  name: string;
  code: string;
  input_type: "text" | "select" | "multiselect" | "boolean" | "number";
  is_variant: boolean;
  sort_order: number;
  values?: AttributeValue[];
}

export interface AttributeValue extends BaseEntity {
  attribute_id: number;
  value: string;
  color_hex?: string;
  sort_order: number;
}

export interface Tag extends BaseEntity {
  name: string;
  slug: string;
}

export interface Warehouse extends BaseEntity {
  seller_id?: number;
  name: string;
  code: string;
  city: string;
  province?: string;
  country_code?: string;
  postal_code?: string;
  address?: string;
  is_active: boolean;
}

export interface BundleItem {
  product_id?: number;
  variant_id?: number;
  quantity: number;
  is_optional: boolean;
}

export interface ProductBundle extends BaseEntity {
  public_id: string;
  name: string;
  slug: string;
  description?: string;
  price_override?: number;
  is_active: boolean;
  items: BundleItem[];
}

export interface ImportJob {
  ID: number;
  PublicID: string;
  JobType: string;
  Status: "pending" | "processing" | "completed" | "failed";
  FileURL: string;
  ErrorLog?: string;
  TotalRows: number;
  Processed: number;
  CreatedBy: string;
  CreatedAt: string;
  CompletedAt?: string;
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
