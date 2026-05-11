import { cookies } from "next/headers";
import { mapBackendUserToFrontend } from "@/services/auth-service";
import axios from "axios";

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
  } catch (error) {
    // Session not found or expired
    return null;
  }
}
