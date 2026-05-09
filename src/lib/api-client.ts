import axios from "axios";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Enterprise API Client
 * 
 * - Client-side: Uses relative paths (empty baseURL) to leverage Next.js rewrites.
 * - Server-side: Uses API_GATEWAY_URL for direct SSR/Server Component calls.
 * - withCredentials: true enables HttpOnly cookie session propagation.
 */
const apiClient = axios.create({
  baseURL: typeof window === "undefined" 
    ? (process.env.API_GATEWAY_URL || "https://localhost:7091")
    : (process.env.NEXT_PUBLIC_API_BASE_URL || ""),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error: Sync UI state with expired/missing cookie
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
