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

export interface RolePermission {
  menuId: string;
  menuName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface RolePermissionsUpdateRequest {
  permissions: {
    menuId: string;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }[];
}
