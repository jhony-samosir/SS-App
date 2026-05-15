import apiClient from "@/lib/api-client";
import { UserListResponse, UserProfile, UserCreateRequest, UserUpdateRequest, UserSession } from "@/types/user";

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
        pageNumber: page, 
        pageSize, 
        searchTerm: filters.search,
        roleName: filters.role,
        isActive: filters.isActive,
        isLocked: filters.isLocked,
        sortBy: sort.sortBy,
        sortDirection: sort.isDescending ? "desc" : "asc"
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
  },

  /**
   * Disable MFA for a specific user (admin action)
   */
  disableMfa: async (id: string, reason: string): Promise<void> => {
    await apiClient.put(`/api/user/${id}/mfa/disable`, { reason });
  },

  /**
   * Reset/Regenerate MFA recovery codes for a user
   */
  resetRecoveryCodes: async (id: string): Promise<void> => {
    await apiClient.put(`/api/user/${id}/mfa/reset-recovery-codes`);
  },

  /**
   * Resend verification email to a user
   */
  resendVerificationEmail: async (id: string): Promise<void> => {
    await apiClient.post(`/api/user/${id}/resend-verification`);
  },

  /**
   * Get all active sessions for a specific user
   */
  getUserSessions: async (id: string): Promise<UserSession[]> => {
    const response = await apiClient.get(`/api/user/${id}/sessions`);
    return response.data;
  },

  /**
   * Revoke a specific user session
   */
  revokeUserSession: async (id: string, sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/user/${id}/sessions/${sessionId}`);
  },

  /**
   * Revoke all active sessions for a user
   */
  revokeAllUserSessions: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/user/${id}/sessions`);
  }
};
