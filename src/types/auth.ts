export interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user?: User;
  accessToken?: string;
  access_token?: string; // Support for varied backend naming
  refreshToken?: string;
  mfaToken?: string;
  isMfaRequired?: boolean;
  message?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  acceptTos: boolean;
  acceptPrivacyPolicy: boolean;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
}

export interface MfaSetupResponse {
  secret: string;
  provisioningUri: string;
}

export interface MfaEnableRequest {
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}
