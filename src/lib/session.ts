import { cookies } from "next/headers";
import { mapBackendUserToFrontend } from "@/services/auth-service";
import axios from "axios";
import logger from "@/lib/logger";

/**
 * Server-side session utility.
 * Fetches the current user profile using request cookies.
 * This avoids localStorage and provides zero-storage security.
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    if (!cookieHeader) return null;

    const API_URL = process.env.API_BASE_URL || "http://localhost:8080";

    // We use raw axios here to avoid client-side interceptors (like sonner/toast)
    // which are not available on the server.
    const response = await axios.get(`${API_URL}/api/user/me`, {
      headers: {
        Cookie: cookieHeader,
        "X-Requested-With": "XMLHttpRequest",
      },
      withCredentials: true,
    });

    return mapBackendUserToFrontend(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      // 401 is expected when user is not logged in or session expired. Only log other statuses (e.g. 500, network errors).
      if (status !== 401) {
        logger.error(
          {
            err: {
              message: error.message,
              stack: error.stack,
              status: status,
              code: error.code,
            },
            path: "/api/user/me",
          },
          "Server-side session check failed with HTTP error"
        );
      }
    } else {
      const isDynamicError = 
        error instanceof Error && 
        (error.name === "DynamicServerError" || error.message.includes("Dynamic server usage"));

      if (!isDynamicError) {
        logger.error(
          {
            err: {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
            path: "/api/user/me",
          },
          "Server-side session check failed with unexpected error"
        );
      }
    }
    // Session not found or expired
    return null;
  }
}
