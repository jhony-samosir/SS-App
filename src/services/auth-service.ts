import apiClient from "@/lib/api-client";
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  MfaVerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
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
   * Request a password reset email
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/forgot-password", data);
    return response.data;
  },

  /**
   * Reset password using token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/auth/reset-password", data);
    return response.data;
  },

  /**
   * Verify email using token from query parameters
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.get(`/api/auth/verify-email?token=${token}`);
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
