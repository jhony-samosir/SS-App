export const ADMIN_PERMISSIONS = [
  "RoleManagement", 
  "MenuManagement", 
  "UserManagement Read",
  "UserManagement Create",
  "UserManagement Update",
  "UserManagement Delete",
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
