import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function requestPermissionAndSync() {
      // Firebase has been removed for local-only development.
      // We mock a local token generation and sync process instead.
      const mockToken = "local-mock-token-" + Math.random().toString(36).substring(7);
      setToken(mockToken);

      // Call Backend API via Next.js Proxy to register the device token
      // The API Gateway will automatically inject the authenticated X-User-Id
      fetch('/api/notifications/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ device_token: mockToken, device_type: 'web-local' })
      }).catch(err => console.error('Failed to sync device:', err));
    }

    requestPermissionAndSync();
  }, []);

  return { token };
}
