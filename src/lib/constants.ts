export const ADMIN_PERMISSIONS = [
  "Admin",
  "Users",
  "Users Read",
  "Roles",
  "Menus",
  "Permissions",
  "SecurityAudit"
];

/**
 * Heuristic cookie names for session detection at the Edge.
 * These should align with YARP and AuthService configurations.
 */
export const AUTH_COOKIE_NAMES = [
  "refreshToken",
  ".AspNetCore.Cookies",
  "session"
];
