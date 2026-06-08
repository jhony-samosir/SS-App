import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification-service";
import { useAuth } from "./use-auth";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getHistory(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // poll every 30 seconds for real-time feel
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: data?.items || [],
    unreadCount: data?.totalUnread || 0,
    isLoading,
    markAsRead: (id: string) => markAsRead.mutate(id),
  };
};
