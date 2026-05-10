export interface MenuItem {
  id: string;
  publicId: string;
  name: string;
  path: string;
  icon?: string;
  sortOrder: number;
  parentId: string | null;
  children?: MenuItem[];
}

export interface MenuCreateRequest {
  name: string;
  path: string;
  icon?: string;
  sortOrder: number;
  parentId?: string | null;
}

export interface MenuUpdateRequest {
  name: string;
  path: string;
  icon?: string;
  sortOrder: number;
  parentId?: string | null;
}
