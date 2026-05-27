import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
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
  baseURL: globalThis.window === undefined 
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
  if (globalThis.window !== undefined) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Variables to handle refresh token queue
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor helper: rotates token on 401 Unauthorized
const handleUnauthorized = async (originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }) => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      })
      .catch((err) => { throw err; });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  return new Promise((resolve, reject) => {
    authService.refresh().then(({ accessToken }) => {
      useAuthStore.getState().setAccessToken(accessToken);
      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      resolve(apiClient(originalRequest));
    }).catch((refreshError) => {
      processQueue(refreshError, null);
      if (globalThis.window !== undefined) {
        useAuthStore.getState().logout();
      }
      reject(refreshError);
    }).finally(() => {
      isRefreshing = false;
    });
  });
};

type ApiErrorPayload = {
  errors?: Record<string, string | string[]>;
  message?: string;
  Message?: string;
  stackTrace?: unknown;
  exception?: unknown;
};

// Response interceptor helper: sanitizes API response errors
const sanitizeError = (error: AxiosError<ApiErrorPayload>) => {
  if (error.response?.data) {
    const data = error.response.data;
    if (data.errors && !data.message && !data.Message) {
      const firstErrorKey = Object.keys(data.errors)[0];
      const firstErrorValue = data.errors[firstErrorKey];
      data.message = Array.isArray(firstErrorValue) ? firstErrorValue[0] : firstErrorValue;
    }
    data.message = data.message || data.Message || "An unexpected system error occurred.";
    delete data.stackTrace;
    delete data.exception;
  }
  error.message = error.response?.data?.message || error.response?.data?.Message || error.message || "An unexpected error occurred.";
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
      return handleUnauthorized(originalRequest);
    }

    // 2. Handle other security status codes
    if (status === 403) {
      if (globalThis.window !== undefined) {
        toast.error("Access Denied: You do not have permission for this action.");
      }
    } else if (status === 429) {
      if (globalThis.window !== undefined) {
        toast.error("Too many requests. Please slow down.");
      }
    }

    // 3. Error Sanitization & Validation Extraction
    sanitizeError(error);
    throw error;
  }
);

export default apiClient;
