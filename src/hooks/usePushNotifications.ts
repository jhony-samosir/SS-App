import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function requestPermissionAndSync() {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted' && messaging) {
            const currentToken = await getToken(messaging, {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'dummy-vapid-key'
            });
            if (currentToken) {
              setToken(currentToken);
              
              // Call Backend API via Next.js Proxy to register the device token
              // The API Gateway will automatically inject the authenticated X-User-Id
              fetch('/api/notifications/devices', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ device_token: currentToken, device_type: 'web' })
              }).catch(err => console.error('Failed to sync device:', err));
            }
          }
        } catch (error) {
          console.error('Push permission or token retrieval failed:', error);
        }
      }
    }

    requestPermissionAndSync();

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground Push Notification Received:', payload);
        // Ideally trigger a Toast or local Snackbar here
      });
      return () => unsubscribe();
    }
  }, []);

  return { token };
}
