# Frontend Security Architecture

This document outlines the security measures implemented in the SS-App frontend to protect against common web vulnerabilities and ensure secure integration with the microservices ecosystem.

## 1. Authentication & Session Management

### Zero-Token Storage
- **Requirement**: No access tokens (JWT) or refresh tokens are stored in `localStorage`, `sessionStorage`, or `indexDB`.
- **Implementation**: We use **Secure HttpOnly Cookies** for session management.
  - Cookies are managed by the API Gateway and Auth Service.
  - The frontend uses `withCredentials: true` in `apiClient` to ensure cookies are sent with every request.
  - This mitigates the risk of **Cross-Site Scripting (XSS)** token theft.

### Local State Synchronization
- The `useAuthStore` (Zustand) persists only non-sensitive user profile data (name, email, permissions) in `localStorage`.
- **Auto-Logout**: A global interceptor in `apiClient.ts` detects `401 Unauthorized` responses and automatically clears the local store, redirecting the user to the login page.

## 2. API Security & CSRF Protection

### Origin Validation
- The `apiClient` is configured to use relative paths for client-side requests, ensuring they target the same origin.
- **CSRF Mitigation**: 
  - All AJAX requests include the `X-Requested-With: XMLHttpRequest` header.
  - Backend services are configured to validate this header for state-changing operations.
  - We rely on the API Gateway's `SameSite=Lax` cookie policy.

## 3. Data Integrity & Safe Rendering

### XSS Prevention
- **JSX Escaping**: We leverage React's built-in XSS protection which automatically escapes all data rendered in JSX.
- **Audit Logs**: Security-sensitive data are rendered as plain text without using `dangerouslySetInnerHTML`.

### Error Sanitization
- Global error handling in `apiClient.ts` sanitizes API responses before they reach the UI.
- Internal stack traces or database error messages are replaced with user-friendly, non-revealing messages to prevent **Information Disclosure**.

## 4. RBAC & Permission Gating

- **Zero-Trust UI**: Every administrative action and navigation link is guarded by the `hasPermission` check.
- **Permission Mapping**: Permissions are standardized as strings (e.g., `UserManagement Read`, `SecurityAudit`).
