import axios from "axios";
import { useAuthStore } from "@/store/use-auth-store";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";

/**
 * Enterprise API Client
 * 
 * - JWT Support: Automatically injects Authorization header.
 * - Silent Refresh: Handles 401 errors by attempting to rotate the token.
 * - Security Guard: Blocks direct microservice calls in development.
 */
const apiClient = axios.create({
  baseURL: typeof window === "undefined" 
    ? (process.env.API_BASE_URL || "http://localhost:8080")
    : (process.env.NEXT_PUBLIC_API_BASE_URL || ""),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor for JWT Injection
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Variables to handle refresh token queue
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for Enterprise Security & Auto-Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 1. Handle 401 Unauthorized (Expired or Missing Token)
    const isRefreshRequest = originalRequest.url?.includes("/api/auth/refresh") || originalRequest.headers?.["X-Skip-Interceptor"];

    if (status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        // If already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          // Attempt to get a new access token using the HttpOnly refresh cookie
          const { accessToken } = await authService.refresh();
          
          // Update the store with the new token
          useAuthStore.getState().setAccessToken(accessToken);

          // Process the queue with the new token
          processQueue(null, accessToken);

          // Update the original request header and resolve
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          resolve(apiClient(originalRequest));
        } catch (refreshError) {
          // Process the queue with error
          processQueue(refreshError, null);

          // Refresh failed (e.g., refresh token expired) -> force logout
          if (typeof window !== "undefined") {
            useAuthStore.getState().logout();
          }
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    // 2. Handle other security status codes
    if (status === 403) {
      if (typeof window !== "undefined") {
        toast.error("Access Denied: You do not have permission for this action.");
      }
    } else if (status === 429) {
      if (typeof window !== "undefined") {
        toast.error("Too many requests. Please slow down.");
      }
    }

    // 3. Error Sanitization
    if (error.response?.data) {
      error.response.data.message = error.response.data.message || "An unexpected system error occurred.";
      delete error.response.data.stackTrace;
      delete error.response.data.exception;
    }

    error.message = error.response?.data?.message || error.message || "An unexpected error occurred.";
    return Promise.reject(error);
  }
);

export default apiClient;
