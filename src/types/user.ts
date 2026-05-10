export interface UserListItem {
  publicId: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  mfaEnabled: boolean;
  isLocked: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  publicId: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  mfaEnabled: boolean;
  isEmailVerified: boolean;
  isLocked: boolean;
  lockedUntil: string | null;
  failedLoginAttempts: number;
  tosAcceptedAt: string | null;
  privacyPolicyAcceptedAt: string | null;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string;
  updatedBy: number | null;
}

export interface UserListResponse {
  items: UserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  isLocked?: boolean;
}

export interface UserSort {
  sortBy?: string;
  isDescending?: boolean;
}

export interface UserCreateRequest {
  email: string;
  fullName: string;
  roleName: string;
}

export interface UserUpdateRequest {
  fullName: string;
  roleName: string;
  isActive: boolean;
}
