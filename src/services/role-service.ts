import apiClient from "@/lib/api-client";
import { Role, RoleCreateRequest, RoleUpdateRequest, RoleListResponse, RolePermission, RolePermissionsUpdateRequest } from "@/types/role";

export const roleService = {
  /**
   * Get paginated list of roles with optional search
   */
  getRoles: async (page = 1, pageSize = 10, search = ""): Promise<RoleListResponse> => {
    const response = await apiClient.get("/api/roles", {
      params: { 
        pageNumber: page, 
        pageSize, 
        searchTerm: search 
      }
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
  },

  /**
   * Get permissions assigned to a role
   */
  getRolePermissions: async (publicId: string): Promise<RolePermission[]> => {
    const response = await apiClient.get(`/api/roles/${publicId}/permissions`);
    return response.data;
  },

  /**
   * Update permissions for a role
   */
  updateRolePermissions: async (publicId: string, data: RolePermissionsUpdateRequest): Promise<void> => {
    await apiClient.put(`/api/roles/${publicId}/permissions`, data);
  }
};
