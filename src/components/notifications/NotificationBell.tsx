"use client";

import React, { useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 hover:bg-muted rounded-xl transition-all" aria-label="Notifications">
          <Bell size={20} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/50">
          <span className="font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-primary font-medium">{unreadCount} unread</span>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <Bell size={32} className="opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                }}
              >
                <div className="mt-0.5">
                  {!n.isRead ? (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  ) : (
                    <CheckCircle size={14} className="text-muted-foreground mt-1" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {n.body}
                  </p>
                  <span className="text-[10px] text-muted-foreground/80 font-medium mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-2 bg-muted/30 border-t border-border/50">
          <button 
            className="w-full py-1.5 text-xs text-center text-muted-foreground hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
