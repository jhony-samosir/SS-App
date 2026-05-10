import apiClient from "@/lib/api-client";
import { MenuItem, MenuCreateRequest, MenuUpdateRequest } from "@/types/menu";

export const menuService = {
  getMenus: async () => {
    const response = await apiClient.get<MenuItem[]>("/api/menus");
    return response.data;
  },

  getMenuTree: async () => {
    const response = await apiClient.get<MenuItem[]>("/api/menus/tree");
    return response.data;
  },

  getMenu: async (publicId: string) => {
    const response = await apiClient.get<MenuItem>(`/api/menus/${publicId}`);
    return response.data;
  },

  createMenu: async (data: MenuCreateRequest) => {
    const response = await apiClient.post<MenuItem>("/api/menus", data);
    return response.data;
  },

  updateMenu: async (publicId: string, data: MenuUpdateRequest) => {
    const response = await apiClient.put<MenuItem>(`/api/menus/${publicId}`, data);
    return response.data;
  },

  deleteMenu: async (publicId: string) => {
    const response = await apiClient.delete(`/api/menus/${publicId}`);
    return response.data;
  }
};
