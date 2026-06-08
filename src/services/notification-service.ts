import apiClient from "@/lib/api-client";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  items: NotificationItem[];
  totalUnread: number;
}

export const notificationService = {
  getHistory: async (): Promise<NotificationHistoryResponse> => {
    try {
      const response = await apiClient.get("/api/notifications/history");
      return response.data;
    } catch (error) {
      // Graceful fallback if backend is not yet ready or fails
      return { items: [], totalUnread: 0 };
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`);
    } catch (error) {
      console.warn("Failed to mark notification as read", error);
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.patch("/api/notifications/read-all");
    } catch (error) {
      console.warn("Failed to mark all as read", error);
    }
  }
};
