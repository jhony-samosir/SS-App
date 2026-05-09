export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user?: User;
  mfaToken?: string;
  isMfaRequired?: boolean;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export interface MfaVerifyRequest {
  mfaToken: string;
  code: string;
}
