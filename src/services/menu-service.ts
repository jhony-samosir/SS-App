import api from "./api";
import { MenuItem, MenuCreateRequest, MenuUpdateRequest } from "@/types/menu";

export const menuService = {
  getMenus: async () => {
    const response = await api.get<MenuItem[]>("/api/menus");
    return response.data;
  },

  getMenuTree: async () => {
    const response = await api.get<MenuItem[]>("/api/menus/tree");
    return response.data;
  },

  getMenu: async (publicId: string) => {
    const response = await api.get<MenuItem>(`/api/menus/${publicId}`);
    return response.data;
  },

  createMenu: async (data: MenuCreateRequest) => {
    const response = await api.post<MenuItem>("/api/menus", data);
    return response.data;
  },

  updateMenu: async (publicId: string, data: MenuUpdateRequest) => {
    const response = await api.put<MenuItem>(`/api/menus/${publicId}`, data);
    return response.data;
  },

  deleteMenu: async (publicId: string) => {
    const response = await api.delete(`/api/menus/${publicId}`);
    return response.data;
  }
};
