"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationBell() {
  const { token } = usePushNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch initial history to calculate unread count
    fetch('/api/notifications/history?limit=10')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const count = data.filter((n: any) => n.Status !== 'READ').length;
          setUnreadCount(count);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <Link href="/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
