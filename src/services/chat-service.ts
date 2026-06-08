import apiClient from "@/lib/api-client";

export interface Conversation {
  id: number;
  public_id: string;
  reference_type?: string;
  reference_id?: string;
  participants: { user_id: string; role: string }[];
}

export interface ChatMessage {
  id: number;
  public_id: string;
  body: string;
  message_type: string;
  created_by: string;
  inserted_at: string;
}

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get("/api/chat/conversations");
    return response.data.data;
  },

  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/api/chat/conversations/${conversationId}/messages`);
    return response.data.data;
  },

  sendMessage: async (conversationId: string, body: string): Promise<ChatMessage> => {
    const response = await apiClient.post(`/api/chat/conversations/${conversationId}/messages`, { body });
    return response.data.data;
  }
};
