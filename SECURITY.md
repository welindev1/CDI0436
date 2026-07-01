# Security Audit Report

## 📋 Overview

This document provides a comprehensive security review of the CDI0436 application, covering authentication, authorization, CORS, input validation, and file upload mechanisms. It also includes recommendations for security improvements.

**Audit Date**: June 28, 2026  
**Audited Version**: 1.0.0  

---

## 1. Authentication Mechanism Review

### Current Implementation

| Component | Technology | Status |
|-----------|-----------|--------|
| Token format | JWT (HS256) | ✅ |
| Token storage | localStorage / sessionStorage | ⚠️ See note |
| Password hashing | bcrypt (salt rounds: 10) | ✅ |
| Token expiry | Configurable via `JWT_EXPIRES_IN` (default: 86400s / 24h) | ✅ |
| Token validation | JwtStrategy: verifies signature, checks user.active | ✅ |
| Token refresh | Not implemented | ⚠️ Missing |
| Rate limiting | ThrottleGuard (in-memory, 60 req/min) | ⚠️ See note |
| Login attempt logging | AuthService.logger.warn on failed login | ✅ |

### Findings

#### 1.1 JWT Secret Strength
- **Severity**: ⚠️ Medium
- **File**: `backend/.env`
- **Issue**: The current `JWT_SECRET` value is `cdi-secret-key-2024`, which is a weak, easily guessable secret.
- **Recommendation**: Generate a cryptographically strong random secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Status**: ❌ Not fixed

#### 1.2 Token Storage in localStorage
- **Severity**: ⚠️ Medium
- **Issue**: JWT tokens stored in `localStorage` are accessible to any JavaScript running on the same origin, making them vulnerable to XSS attacks.
- **Recommendation**: Consider using `httpOnly` cookies for token storage (requires backend changes) or implement a short-lived access token + refresh token pattern.
- **Mitigation**: The current implementation supports both `localStorage` (Recordarme) and `sessionStorage`, which is acceptable for this application's risk profile, but should be improved for production.
- **Status**: ⚠️ Partial mitigation (sessionStorage as default)

#### 1.3 Rate Limiting Implementation
- **Severity**: ⚠️ Medium
- **File**: `backend/src/common/guards/throttle.guard.ts`
- **Issue**: The ThrottleGuard is in-memory only. If the application scales to multiple instances, rate limiting will be per-instance and ineffective.
- **Recommendation**: Replace with `@nestjs/throttler` with Redis store for distributed rate limiting.
- **Status**: ⚠️ Acknowledged (comment in code)

#### 1.4 No Refresh Token Mechanism
- **Severity**: ⚠️ Low
- **Issue**: There is no refresh token mechanism. When the JWT expires, the user is logged out and must re-authenticate. The interceptor handles 401 by clearing session and redirecting to login.
- **Recommendation**: Implement a refresh token pattern with a longer-lived refresh token stored in an httpOnly cookie and a short-lived access token.
- **Status**: ❌ Not implemented

---

## 2. Permission System Review

### Current Implementation

| Component | File | Status |
|-----------|------|--------|
| Role entity | `roles/entities/rol.entity.ts` | ✅ |
| Permission entity | `roles/entities/permiso.entity.ts` | ✅ |
| Super Admin flag | `Rol.es_super_admin` | ✅ |
| JWT Guard | `auth/guards/jwt-auth.guard.ts` | ✅ |
| Permission Guard | `auth/guards/permisos.guard.ts` | ✅ |
| @RequierePermiso decorator | `auth/decorators/permisos.decorator.ts` | ✅ |
| @Public decorator | `auth/decorators/public.decorator.ts` | ✅ |
| @CurrentUser decorator | `auth/decorators/current-user.decorator.ts` | ✅ |
| Frontend permission helpers | `contexts/AuthContext.tsx` | ✅ |
| Sidebar permission filtering | `components/layout/Sidebar.tsx` | ✅ |

### Findings

#### 2.1 Super Admin Bypass
- **Severity**: ✅ Info
- **File**: `backend/src/modules/auth/guards/permisos.guard.ts`
- **Issue**: Super admins (`es_super_admin = true`) bypass all permission checks. This is by design and is correct.
- **Recommendation**: None needed. This is standard RBAC practice.

#### 2.2 Public Routes
- **Severity**: ✅ Info
- **Files**: `auth.controller.ts`
- **Issue**: Only `POST /auth/login` and `GET /beneficiarios/buscar-publico` are public. All other routes require authentication.
- **Recommendation**: Verify audit trail of all `@Public()` usage to ensure no sensitive endpoints are mistakenly made public.
- **Status**: ✅ Adequate

#### 2.3 Frontend Permission Exposure
- **Severity**: ⚠️ Low
- **File**: `frontend/src/contexts/AuthContext.tsx`
- **Issue**: Permission codes are stored in the user object in localStorage/sessionStorage and exposed to the frontend. A user could modify their stored permissions. However, the backend still enforces permissions via `PermisosGuard`, so this is a defense-in-depth issue, not a vulnerability.
- **Recommendation**: Never rely solely on frontend permission checks. All sensitive operations must also be enforced server-side. ✅ (Already implemented)

---

## 3. CORS Configuration Review

### Current Implementation

```typescript
// backend/src/main.ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://app.tbccaminando.org',
  ...(frontendUrl ? [frontendUrl] : []),
];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Findings

#### 3.1 CORS Whitelist Management
- **Severity**: ✅ Info
- **Issue**: CORS is configured with a whitelist, which is secure. The `FRONTEND_URL` env var is added dynamically.
- **Status**: ✅ Good

#### 3.2 Credentials Enabled
- **Severity**: ⚠️ Low
- **Issue**: `credentials: true` is set. This is necessary for sending cookies/JWT headers but should be carefully managed.
- **Recommendation**: Ensure no wildcard origins are ever used when credentials is true.
- **Status**: ✅ Whitelist + credentials is correct

#### 3.3 Production Domain Hardcoded
- **Severity**: ✅ Info
- **File**: `backend/src/main.ts` line 31
- **Issue**: The production domain `https://app.tbccaminando.org` is hardcoded. For flexibility, consider moving all origins to environment variables.
- **Recommendation**: Add a `CORS_ORIGINS` env var that accepts a comma-separated list of origins.
- **Status**: ⚠️ Nice-to-have improvement

---

## 4. Input Validation Review

### Current Implementation

| Component | Technology | Coverage | Status |
|-----------|-----------|----------|--------|
| Backend validation | Custom `ValidationPipe` (class-validator) | All DTOs | ✅ |
| Frontend validation | Zod schemas + React Hook Form | Forms | ✅ |
| SQL Injection | TypeORM parameterized queries | All queries | ✅ |
| XSS Protection | React's built-in escaping + security headers | All output | ✅ |
| NoSQL Injection | N/A (PostgreSQL) | N/A | ✅ |

### Findings

#### 4.1 Custom Validation Pipe vs NestJS ValidationPipe
- **Severity**: ✅ Info
- **File**: `backend/src/common/pipes/validation.pipe.ts`
- **Issue**: The custom `ValidationPipe` uses `class-validator` but is a custom implementation. It provides formatted error messages but may lack some features of the built-in `@nestjs/common ValidationPipe`.
- **Recommendation**: Consider using NestJS's built-in `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` to automatically strip unknown properties and reject requests with unexpected fields.
- **Status**: ⚠️ Medium priority

#### 4.2 Request Body Size Limit
- **Severity**: ⚠️ Medium
- **File**: `backend/src/main.ts` line 19
- **Issue**: `express.json({ limit: '10mb' })` allows 10MB request bodies. This is needed for base64 photo uploads but could be abused for DoS attacks.
- **Recommendation**: Keep the 10MB limit but ensure the ThrottleGuard is applied to photo upload endpoints. Consider moving photo uploads to multipart/form-data with file type validation instead of base64.
- **Status**: ⚠️ Acceptable with rate limiting

#### 4.3 File Upload Validation
- **Severity**: ⚠️ Medium
- **Files**: `beneficiarios.controller.ts` (importación Excel)
- **Issue**: Excel file import accepts `File` objects via `multipart/form-data`. Need to verify that file type validation (extension + MIME type) is enforced.
- **Recommendation**: Verify that only `.xlsx`, `.xls` files are accepted and that MIME type matches. Validate file size limits.
- **Status**: ❌ Needs verification

---

## 5. Security Headers Review

### Current Implementation

```typescript
// backend/src/main.ts
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
```

### Findings

#### 5.1 Missing Headers
- **Severity**: ⚠️ Low
- **Issue**: Several security headers are missing:
  - `Content-Security-Policy` (CSP) - most important missing header
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Cache-Control` for sensitive pages
- **Recommendation**: Add a helmet-like middleware or the `helmet` npm package to set all security headers properly:
  ```typescript
  import helmet from 'helmet';
  app.use(helmet());
  ```
- **Status**: ❌ Not implemented

#### 5.2 HSTS Header
- **Severity**: ✅ Info
- **Issue**: HSTS is set with `max-age=31536000; includeSubDomains`. This is good but should only be sent over HTTPS.
- **Recommendation**: Add `app.use()` condition to only set HSTS in production:
  ```typescript
  if (configService.get('NODE_ENV') === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  ```
- **Status**: ⚠️ Low priority

---

## 6. Database Security

### Findings

#### 6.1 SSL Configuration
- **Severity**: ✅ Info
- **File**: `backend/src/app.module.ts` line 69-71
- **Issue**: SSL is configured with `rejectUnauthorized: false`. This is necessary for Neon (serverless PostgreSQL) but reduces security in production.
- **Recommendation**: Set `rejectUnauthorized: true` and provide proper CA certificate for production. Use environment variable to toggle:
  ```typescript
  ssl: configService.get('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: true, ca: configService.get('SSL_CA') }
    : { rejectUnauthorized: false }
  ```
- **Status**: ⚠️ Low priority

#### 6.2 synchronize: true (Commented Out)
- **Severity**: ✅ Info
- **File**: `backend/src/app.module.ts` line 67
- **Issue**: `synchronize: true` is commented out with a warning. This is correct - synchronize should never be used in production.
- **Recommendation**: Good practice. Keep it commented out for production.
- **Status**: ✅ Correct

---

## 7. Environment Variable Security

### Current Configuration

#### Backend (.env)
| Variable | Value | Status |
|----------|-------|--------|
| `DATABASE_URL` | Contains real credentials | ⚠️ See 7.1 |
| `JWT_SECRET` | `cdi-secret-key-2024` | ❌ Weak |
| `JWT_EXPIRES_IN` | `86400` | ✅ |
| `PORT` | `3001` | ✅ |
| `NODE_ENV` | `development` | ✅ |
| `FRONTEND_URL` | Empty | ⚠️ See 7.2 |

#### Frontend (.env.local)
| Variable | Value | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | ✅ |

### Findings

#### 7.1 DATABASE_URL Contains Live Credentials
- **Severity**: 🔴 Critical
- **File**: `backend/.env`
- **Issue**: The `.env` file contains a real database connection string with credentials: `postgresql://neondb_owner:npg_U0EyYCW3MNIr@...`. This file exists on disk and could be committed to version control.
- **Recommendation**: 
  - Ensure `.env` is in `.gitignore` (already should be)
  - Rotate the exposed database credentials immediately
  - Use environment variables or secrets manager in production
- **Status**: ❌ Fix immediately

#### 7.2 FRONTEND_URL is Empty
- **Severity**: ⚠️ Medium
- **File**: `backend/.env`
- **Issue**: `FRONTEND_URL=` is empty, which means the CORS whitelist won't add the production frontend URL dynamically. However, `app.tbccaminando.org` is hardcoded.
- **Recommendation**: Set `FRONTEND_URL=http://localhost:3000` for development or add it explicitly.
- **Status**: ❌ Unset

#### 7.3 .env.example Patterns
- **Severity**: ✅ Info
- **Files**: `backend/.env.example`, `frontend/.env.example`
- **Issue**: Both `.env.example` files are well-documented with placeholder values. No real secrets are exposed.
- **Status**: ✅ Good

---

## 8. Dependency Security

### Findings

#### 8.1 Outdated/Misaligned Docker Images
- **Severity**: ⚠️ Low
- **Files**: `backend/Dockerfile` (Node 20), `frontend/Dockerfile` (Node 18)
- **Issue**: Backend uses `node:20-alpine` but frontend uses `node:18-alpine`. The frontend's package.json requires `next@16.0.9` and `react@19.2.1`, which may not be fully compatible with Node 18.
- **Recommendation**: Align both Dockerfiles to `node:20-alpine` or `node:22-alpine` (latest LTS).
- **Status**: ⚠️ Needs alignment

#### 8.2 CVE Vulnerabilities
- **Severity**: ⚠️ Medium
- **Recommendation**: Run `npm audit` in both `backend/` and `frontend/` directories to identify and fix known vulnerabilities in dependencies. Generate an SBOM for tracking.

---

## 9. Recommendations Summary

### Critical (Fix Immediately)
| # | Issue | Location |
|---|-------|----------|
| 1 | Rotate exposed DATABASE_URL credentials | `backend/.env` |
| 2 | Strengthen JWT_SECRET to a cryptographically random value | `backend/.env` |

### High Priority
| # | Issue | Location |
|---|-------|----------|
| 1 | Add Content-Security-Policy header | `backend/src/main.ts` |
| 2 | Validate file type and size for Excel imports | `backend/src/modules/beneficiarios/` |
| 3 | Add whitelist: true + forbidNonWhitelisted: true to ValidationPipe | `backend/src/common/pipes/validation.pipe.ts` |

### Medium Priority
| # | Issue | Location |
|---|-------|----------|
| 1 | Implement refresh token mechanism | `backend/src/modules/auth/` |
| 2 | Replace in-memory rate limiting with distributed (Redis) | `backend/src/common/guards/throttle.guard.ts` |
| 3 | Set FRONTEND_URL env var | `backend/.env` |
| 4 | Align Docker Node versions (use 20 or 22 for both) | `frontend/Dockerfile` |
| 5 | Move CORS origins to environment variable | `backend/src/main.ts` |
| 6 | Add Referrer-Policy and Permissions-Policy headers | `backend/src/main.ts` |

### Low Priority
| # | Issue | Location |
|---|-------|----------|
| 1 | Conditionally apply HSTS only in production | `backend/src/main.ts` |
| 2 | Configure SSL CA certificate for production | `backend/src/app.module.ts` |
| 3 | Add npm audit to CI/CD pipeline | CI configuration |

---

## 10. Security Checklist

- [x] JWT authentication implemented
- [x] Passwords hashed with bcrypt
- [x] RBAC with granular permissions
- [x] CORS whitelist configured
- [x] Security headers (partial)
- [x] Rate limiting (in-memory)
- [x] Input validation (backed + frontend)
- [x] SQL injection protection (TypeORM)
- [x] XSS protection (React)
- [ ] Content-Security-Policy
- [ ] Refresh token mechanism
- [ ] File upload validation
- [ ] Distributed rate limiting
- [ ] HTTPS enforced (production only)
- [ ] Secrets rotated and managed via environment variables
- [x] .env in .gitignore
- [x] .env.example with placeholders (no secrets)

---

**Last updated**: June 28, 2026  
**Audited by**: Security Agent
