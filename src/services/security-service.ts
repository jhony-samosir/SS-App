import apiClient from "@/lib/api-client";
import { LoginAttemptListResponse } from "@/types/security";

export const securityService = {
  /**
   * Get paginated list of login attempts with filtering
   */
  getLoginAttempts: async (
    page = 1,
    pageSize = 10,
    filters: { 
      email?: string, 
      ipAddress?: string, 
      isSuccess?: boolean, 
      startDate?: string, 
      endDate?: string 
    } = {}
  ): Promise<LoginAttemptListResponse> => {
    const response = await apiClient.get("/api/security/login-attempts", {
      params: { 
        page, 
        pageSize, 
        ...filters 
      }
    });
    return response.data;
  }
};
