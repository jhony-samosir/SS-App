import apiClient from "@/lib/api-client";
import { UserProfile, UpdateProfileRequest } from "@/types/profile";

/**
 * Profile Service
 * 
 * Handles all profile-related API interactions with the ProfileService microservice.
 * All requests go through the API Gateway via Next.js rewrites.
 */
export const profileService = {
  /**
   * Get user profile by publicId
   * @param userPublicId - The UUID of the user
   */
  getProfile: async (userPublicId: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/api/profiles/${userPublicId}`);
    return response.data;
  },

  /**
   * Update user profile
   * @param userPublicId - The UUID of the user
   * @param data - Partial profile data to update
   */
  updateProfile: async (
    userPublicId: string,
    data: UpdateProfileRequest
  ): Promise<UserProfile> => {
    const response = await apiClient.put(
      `/api/profiles/${userPublicId}`,
      data
    );
    return response.data;
  }
};