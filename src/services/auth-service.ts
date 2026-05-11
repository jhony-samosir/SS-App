import apiClient from "@/lib/api-client";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  MfaVerifyRequest,
  MfaSetupResponse,
  MfaEnableRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from "@/types/auth";

/**
 * Helper to map backend UserProfileDto to frontend User interface
 */
const mapBackendUserToFrontend = (backendUser: any) => {
  if (!backendUser) return null;
  return {
    id: backendUser.publicId,
    name: backendUser.fullName,
    email: backendUser.email,
    roleName: backendUser.role?.name || "User",
    permissions: backendUser.permissions || []
  };
};

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
    const result = response.data;
    return {
      ...result,
      user: result.user ? mapBackendUserToFrontend(result.user) : undefined
    };
  },

  /**
   * Login user
   * Handles 200 OK (Success) and 202 Accepted (MFA Required)
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/api/auth/login", data);
    const result = response.data;
    return {
      ...result,
      user: result.user ? mapBackendUserToFrontend(result.user) : undefined
    };
  },

  /**
   * Refresh the access token using the HttpOnly refresh cookie
   */
  refresh: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post("/api/auth/refresh");
    return response.data;
  },

  /**
   * Verify MFA code using the mfaToken
   */
  verifyMfa: async (data: MfaVerifyRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/api/mfa/verify", data);
    const result = response.data;
    return {
      ...result,
      user: result.user ? mapBackendUserToFrontend(result.user) : undefined
    };
  },

  /**
   * Initiate MFA setup for the current logged-in user
   */
  mfaSetup: async (): Promise<MfaSetupResponse> => {
    const response = await apiClient.post("/api/mfa/setup");
    return response.data;
  },

  /**
   * Finalize and enable MFA for the current logged-in user
   */
  mfaEnable: async (data: MfaEnableRequest): Promise<{ message: string }> => {
    const response = await apiClient.post("/api/mfa/enable", data);
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
    const response = await apiClient.get("/api/user/me");
    const data = response.data;
    return {
      ...data,
      user: data.user ? mapBackendUserToFrontend(data.user) : null
    };
  }
};
