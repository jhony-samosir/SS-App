import { useEffect, useState } from "react";
import { Socket, Channel } from "phoenix";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, ChatMessage, Conversation } from "@/services/chat-service";
import { useAuthStore } from "@/store/use-auth-store";

export const useChatConversations = () => {
  return useQuery({
    queryKey: ["chat_conversations"],
    queryFn: chatService.getConversations,
  });
};

export const useChat = (conversationId?: string) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat_messages", conversationId],
    queryFn: () => chatService.getMessages(conversationId!),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId || !user) return;

    const baseApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const socketUrl = baseApi.replace("http", "ws") + "/socket";
    
    const socket = new Socket(socketUrl, { params: { user_id: user.id } });
    socket.connect();

    const roomChannel = socket.channel(`room:${conversationId}`);
    roomChannel.join()
      .receive("ok", () => console.log("Joined chat room successfully"))
      .receive("error", (resp) => console.error("Unable to join", resp));

    roomChannel.on("new_msg", (newMsg: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(["chat_messages", conversationId], (oldData) => {
        if (!oldData) return [newMsg];
        if (oldData.some(m => m.id === newMsg.id || m.public_id === newMsg.public_id)) return oldData;
        return [...oldData, newMsg];
      });
    });

    setChannel(roomChannel);

    return () => {
      roomChannel.leave();
      socket.disconnect();
    };
  }, [conversationId, user, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (body: string) => chatService.sendMessage(conversationId!, body),
  });

  const sendMessage = (body: string) => {
    if (channel) {
      // Try WebSocket first
      channel.push("new_msg", { body });
    } else {
      // Fallback
      sendMessageMutation.mutate(body);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending
  };
};
