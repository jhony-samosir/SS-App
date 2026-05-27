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
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null; // ISO date string (YYYY-MM-DD)
}