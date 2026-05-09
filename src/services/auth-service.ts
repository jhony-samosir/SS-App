import apiClient from "@/lib/api-client";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  MfaVerifyRequest 
} from "@/types/auth";

/**
 * Enterprise Authentication Service
 * 
 * Handles all authentication-related API interactions.
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post("/api/auth/register", data);
    return response.data;
  },

  /**
   * Login user
   * Handles 200 OK (Success) and 202 Accepted (MFA Required)
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/api/auth/login", data);
    return response.data;
  },

  /**
   * Verify MFA code using the mfaToken
   */
  verifyMfa: async (data: MfaVerifyRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/api/auth/mfa/verify", data);
    return response.data;
  },

  /**
   * Logout user and clear session cookies
   */
  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout");
  },

  /**
   * Get current user session info (useful for initialization/sync)
   */
  getCurrentUser: async (): Promise<{ user: any }> => {
    const response = await apiClient.get("/api/auth/me");
    return response.data;
  }
};
