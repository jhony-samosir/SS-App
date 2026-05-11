# Security Hardening Roadmap (Post-JWT Implementation)

Following the security review of the JWT authentication transition, the following technical debt and security enhancements have been identified for implementation in the next sprints.

## 1. XSS Mitigation (Priority: High)
- **Content Security Policy (CSP)**: Implement a strict CSP in `next.config.ts` to restrict script execution and prevent unauthorized data exfiltration.
- **Dependency Audit**: Regular auditing of frontend dependencies to ensure no malicious packages are introduced that could access `localStorage`.
- **UI Sanitization**: Enforce the use of sanitization libraries for any dynamic content rendering to prevent injection attacks.

## 2. Token Life-cycle Management (Priority: High)
- **Short-lived Access Tokens**: Backend should be configured to issue JWTs with a short TTL (5-15 minutes).
- **HttpOnly Refresh Tokens**: Backend must implement a refresh token mechanism delivered exclusively via `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **Silent Refresh Interceptor**: Update `api-client.ts` to handle `401 Unauthorized` errors by automatically calling the refresh endpoint and retrying the failed request.

## 3. Architecture Evolution (Priority: Medium)
- **Backend-For-Frontend (BFF) Pattern**: Transition the management of JWTs to the API Gateway (YARP).
- **Zero-Token Storage**: Move towards a "Tokenless Frontend" where the client only manages session cookies, and the gateway handles JWT injection to downstream microservices.

---
*Documented by Senior Frontend Engineer based on Tech Lead Review - 2026-05-11*
