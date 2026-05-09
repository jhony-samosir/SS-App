# API Gateway Integration: SS-App

This document outlines the configuration for communicating with the SAMSTORE microservices via the API Gateway.

## Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: The public-facing URL of the API Gateway (used by the browser).
- `API_BASE_URL`: The internal/server-facing URL of the API Gateway (used by Server Components and SSR).

In development, these are typically set to `https://localhost:7091`.

## Key Integration Patterns

### 1. Same-Origin Communication (DX)
The application adopts an **Approach A** routing pattern:
- **Client-side**: Uses **relative paths** (e.g., `/api/...`). Next.js `rewrites` in `next.config.ts` proxy these calls to the Gateway.
- **Benefit**: This eliminates most CORS complexities and ensures the browser sees API calls as "same-origin".

### 2. Cookie-Based Authentication
- `apiClient` uses `withCredentials: true` to automatically propagate session cookies.
- **State Integrity**: The `apiClient` response interceptor is configured to automatically call `logout()` on the `useAuthStore` if a `401 Unauthorized` is received, ensuring the UI state stay synchronized with the session cookie.

### 3. Local Development Security
- **TLS Verification**: Do NOT use `NODE_TLS_REJECT_UNAUTHORIZED=0`. Instead, use `mkcert` or trust the local Development CA to ensure secure HTTPS communication between Node.js and the Gateway.
