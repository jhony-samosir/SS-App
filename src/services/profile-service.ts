import apiClient from "@/lib/api-client";
import { Address, UpdateProfileRequest, UserProfile } from "@/types/profile";

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
    data: UpdateProfileRequest,
  ): Promise<UserProfile> => {
    const response = await apiClient.put(`/api/profiles/${userPublicId}`, data);
    return response.data;
  },

  /**
   * Create a new address for user profile
   * @param userPublicId - The UUID of the user
   * @param address - Address data
   */
  createAddress: async (
    userPublicId: string,
    address: Omit<Address, "publicId">,
  ): Promise<Address> => {
    const response = await apiClient.post(
      `/api/profiles/${userPublicId}/addresses`,
      address,
    );
    return response.data;
  },

  /**
   * Update an existing address
   * @param userPublicId - The UUID of the user
   * @param addressPublicId - The UUID of the address
   * @param address - Address data
   */
  updateAddress: async (
    userPublicId: string,
    addressPublicId: string,
    address: Omit<Address, "publicId">,
  ): Promise<Address> => {
    const response = await apiClient.put(
      `/api/profiles/${userPublicId}/addresses/${addressPublicId}`,
      address,
    );
    return response.data;
  },

  /**
   * Soft-delete an address
   * @param userPublicId - The UUID of the user
   * @param addressPublicId - The UUID of the address
   */
  deleteAddress: async (
    userPublicId: string,
    addressPublicId: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/api/profiles/${userPublicId}/addresses/${addressPublicId}`,
    );
  },

  /**
   * Set an address as the default address
   * @param userPublicId - The UUID of the user
   * @param addressPublicId - The UUID of the address
   */
  setDefaultAddress: async (
    userPublicId: string,
    addressPublicId: string,
  ): Promise<void> => {
    await apiClient.put(
      `/api/profiles/${userPublicId}/addresses/${addressPublicId}/default`,
    );
  },
};
