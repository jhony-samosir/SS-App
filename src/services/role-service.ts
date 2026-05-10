import apiClient from "@/lib/api-client";
import { Role, RoleCreateRequest, RoleUpdateRequest, RoleListResponse } from "@/types/role";

export const roleService = {
  /**
   * Get paginated list of roles with optional search
   */
  getRoles: async (page = 1, pageSize = 10, search = ""): Promise<RoleListResponse> => {
    const response = await apiClient.get("/api/roles", {
      params: { page, pageSize, search }
    });
    return response.data;
  },

  /**
   * Get a single role by its publicId
   */
  getRole: async (publicId: string): Promise<Role> => {
    const response = await apiClient.get(`/api/roles/${publicId}`);
    return response.data;
  },

  /**
   * Create a new role
   */
  createRole: async (data: RoleCreateRequest): Promise<Role> => {
    const response = await apiClient.post("/api/roles", data);
    return response.data;
  },

  /**
   * Update an existing role
   */
  updateRole: async (publicId: string, data: RoleUpdateRequest): Promise<Role> => {
    const response = await apiClient.put(`/api/roles/${publicId}`, data);
    return response.data;
  },

  /**
   * Delete a role
   */
  deleteRole: async (publicId: string): Promise<void> => {
    await apiClient.delete(`/api/roles/${publicId}`);
  }
};
