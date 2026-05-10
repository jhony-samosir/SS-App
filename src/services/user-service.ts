import apiClient from "@/lib/api-client";
import { UserListResponse, UserProfile, UserCreateRequest, UserUpdateRequest } from "@/types/user";

export const userService = {
  /**
   * Get paginated list of users with search, filters, and sorting
   */
  getUsers: async (
    page = 1, 
    pageSize = 10, 
    filters: { search?: string, role?: string, isActive?: boolean, isLocked?: boolean } = {},
    sort: { sortBy?: string, isDescending?: boolean } = {}
  ): Promise<UserListResponse> => {
    const response = await apiClient.get("/api/user", {
      params: { 
        page, 
        pageSize, 
        ...filters,
        ...sort
      }
    });
    return response.data;
  },

  /**
   * Get a single user by its publicId
   */
  getUser: async (publicId: string): Promise<UserProfile> => {
    const response = await apiClient.get(`/api/user/${publicId}`);
    return response.data;
  },

  /**
   * Create a new user
   */
  createUser: async (data: UserCreateRequest): Promise<UserProfile> => {
    const response = await apiClient.post("/api/user", data);
    return response.data;
  },

  /**
   * Update an existing user
   */
  updateUser: async (id: string, data: UserUpdateRequest): Promise<UserProfile> => {
    const response = await apiClient.put(`/api/user/${id}`, data);
    return response.data;
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/user/${id}`);
  },

  /**
   * Unlock a user's account
   */
  unlockUser: async (id: string): Promise<void> => {
    await apiClient.put(`/api/user/${id}/unlock`);
  },

  /**
   * Force a password reset for a user
   */
  forceResetPassword: async (id: string): Promise<void> => {
    await apiClient.put(`/api/user/${id}/force-reset-password`);
  }
};
