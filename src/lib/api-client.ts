import axios from "axios";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "sonner";

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
    // CSRF Protection: Standard header to identify AJAX requests
    "X-Requested-With": "XMLHttpRequest",
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

// Response interceptor for Enterprise Security
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const path = error.config?.url;

    if (status === 401) {
      // Unauthorized: Clear local state as the session cookie is likely invalid/expired
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
      }
    } else if (status === 403) {
      // Forbidden: Log for audit and show global notification
      console.error(`[Security Audit] Access denied for path: ${path}`);
      if (typeof window !== "undefined") {
        toast.error("Access Denied: You do not have permission for this action.");
      }
    } else if (status === 429) {
      // Rate Limited: Surface standardized message
      console.warn(`[Security Guard] Rate limit exceeded for path: ${path}`);
      if (typeof window !== "undefined") {
        toast.error("Too many requests. Please slow down.");
      }
    }

    // Effective Error Sanitization: Mutate the response data so UI components 
    // reading from error.response.data.message get the sanitized version.
    if (error.response?.data) {
      const originalMessage = error.response.data.message;
      error.response.data.message = originalMessage || "An unexpected system error occurred. Please try again later.";
      
      // Clean up sensitive internal details if they exist
      delete error.response.data.stackTrace;
      delete error.response.data.exception;
      delete error.response.data.internalDetails;
    }

    // Also set the root message for consistency with Standard Error objects
    error.message = error.response?.data?.message || error.message || "An unexpected error occurred.";

    return Promise.reject(error);
  }
);

export default apiClient;
