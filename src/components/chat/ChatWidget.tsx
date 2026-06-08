"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useChat, useChatConversations } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/use-auth-store";
import { format } from "date-fns";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { data: conversations = [], isLoading: isLoadingConv } = useChatConversations();
  
  // For MVP, select the first conversation or null
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].public_id);
    }
  }, [conversations, activeConvId]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col w-[350px] h-[500px] overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-semibold text-lg">Support Chat</h3>
              <p className="text-xs text-blue-100">Typically replies instantly</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
            {isLoadingConv ? (
              <div className="flex justify-center items-center h-full">Loading...</div>
            ) : !activeConvId ? (
              <div className="flex justify-center items-center h-full text-gray-500 text-sm">No active conversations.</div>
            ) : (
              <ChatRoom conversationId={activeConvId} />
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 absolute bottom-0 right-0"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

const ChatRoom = ({ conversationId }: { conversationId: string }) => {
  const { messages, isLoading, sendMessage, isSending } = useChat(conversationId);
  const { user } = useAuthStore();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading messages...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isMine = m.created_by === user?.id;
          return (
            <div key={idx} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? "bg-blue-600 text-white rounded-br-sm shadow-md" : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm"}`}>
                <p className="text-sm">{m.body}</p>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {m.inserted_at ? format(new Date(m.inserted_at), "HH:mm") : "Sending..."}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full flex justify-center items-center transition-colors shadow-sm shrink-0"
          >
            <Send size={16} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};
