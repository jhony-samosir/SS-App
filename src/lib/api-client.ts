import axios from "axios";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * Enterprise API Client
 * 
 * - Client-side: Uses relative paths (empty baseURL) to leverage Next.js rewrites.
 *   This ensures that browser cookies (HttpOnly, Secure) are automatically attached 
 *   to requests because they are sent to the same origin.
 * - Server-side: Uses API_BASE_URL for direct SSR/Server Component calls to the Gateway.
 * - withCredentials: true ensures that cross-site Access-Control requests use credentials 
 *   such as cookies, authorization headers or TLS client certificates.
 */
const apiClient = axios.create({
  baseURL: typeof window === "undefined" 
    ? (process.env.API_BASE_URL || "https://localhost:7091")
    : (process.env.NEXT_PUBLIC_API_BASE_URL || ""),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Development Runtime Guard: Block direct microservice calls
apiClient.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    const requestUrl = config.url || "";
    // If the request is an absolute URL and doesn't target the gateway proxy path
    if (requestUrl.startsWith("http") && !requestUrl.includes("/api/")) {
      const errorMessage = `[Security Guard] Direct microservice call detected: ${requestUrl}. All requests must go through the /api/ proxy path to ensure proper security and session propagation.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
  return config;
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
