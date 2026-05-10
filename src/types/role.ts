export interface Role {
  id: string;
  publicId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateRequest {
  name: string;
  description: string;
}

export interface RoleUpdateRequest {
  name: string;
  description: string;
}

export interface RoleListResponse {
  items: Role[];
  totalCount: number;
  page: number;
  pageSize: number;
}
