export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  isSuccess: boolean;
  failureReason?: string;
  createdAt: string;
  location?: string;
}

export interface LoginAttemptListResponse {
  items: LoginAttempt[];
  totalCount: number;
}
