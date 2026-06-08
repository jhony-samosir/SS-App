"use client";
import React, { useEffect, useState } from 'react';

type Notification = {
  ID: string;
  NotificationType: string;
  Status: string;
  CreatedAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/history')
      .then(res => res.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.ID === id ? { ...n, Status: 'READ' } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Loading Notification Center...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Notification Center</h1>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
          <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-400 font-medium">No notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div 
              key={notif.ID} 
              onClick={() => markAsRead(notif.ID)}
              className={`p-5 rounded-2xl border shadow-lg backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                notif.Status === 'READ' 
                  ? 'bg-gray-800/40 border-gray-800 opacity-60' 
                  : 'bg-gradient-to-r from-gray-800 to-gray-800/80 border-blue-500/50 hover:border-blue-400 shadow-blue-500/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${notif.Status === 'READ' ? 'bg-gray-700' : 'bg-blue-500/20 text-blue-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{notif.NotificationType}</h3>
                    <p className="text-sm text-gray-400 mt-1">{notif.Status === 'READ' ? 'Read' : 'Tap to mark as read'}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-900/50 px-2 py-1 rounded-md">
                  {new Date(notif.CreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
