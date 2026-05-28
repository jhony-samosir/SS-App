export interface Address {
  publicId?: string;
  addressLabel: string;
  receiverName: string;
  receiverPhone: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface UserProfile {
  id: number;
  publicId: string;
  userId: number;
  userPublicId: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null; // ISO date string (YYYY-MM-DD)
  createdAt: string;
  updatedAt: string | null;
  addresses?: Address[];
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null; // ISO date string (YYYY-MM-DD)
}
