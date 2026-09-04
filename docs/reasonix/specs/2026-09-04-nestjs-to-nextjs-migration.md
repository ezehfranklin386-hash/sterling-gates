# Backend Migration: Nest.js → Next.js

## Overview

This document describes the design for migrating the backend from Nest.js to Next.js API routes. The goal is to completely remove Nest.js and consolidate all backend logic into the Next.js application for a single, streamlined deployment.

## Current State

### Backend Architecture

- **Framework**: Nest.js v11 with TypeScript and Express
- **Deployment**: Vercel serverless functions (`api/index.ts`)
- **Database**: Supabase
- **API Endpoints**: 28 total endpoints across 10 controllers

### Module Breakdown

| Module | File | Endpoints | Description |
|--------|------|-----------|-------------|
| Advisors | `advisors.controller.ts` | 5 | GET admin, GET (public), POST, PATCH :id, DELETE :id |
| Auth | `auth.controller.ts` | 2 | POST login (public), GET me |
| Blogs | `blogs.controller.ts` | 6 | GET (public list), GET admin, GET :slug (public), POST, PATCH :id, DELETE :id |
| Curations | `curations.controller.ts` | 6 | GET admin, GET (public), GET :slug (public), POST, PATCH :id, DELETE :id |
| Enquiries | `enquiries.controller.ts` | 3 | POST (public), GET, PATCH :id |
| Settings | `settings.controller.ts` | 2 | GET (public), PUT |
| Newsletter | `newsletter.controller.ts` | 3 | POST (public), GET, DELETE :id |
| Properties | `properties.controller.ts` | 6 | GET admin, GET (public, 9 query params), GET :slug (public), POST, PATCH :id, DELETE :id |
| Uploads | `uploads.controller.ts` | 1 | POST (file upload) |
| Health | `health.controller.ts` | 1 | GET (public liveness probe) |

### Security

- **AuthGuard**: Global JWT verification, skips `@Public` routes
- **AdminGuard**: Route-level check for admin role from `app_users` table

### Validation

- Global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, `transform`
- 13 DTOs using `class-validator` decorators

### Custom Decorators

- `@Public()` - Bypass AuthGuard
- `@CurrentUser()` - Extract authenticated user from JWT

### Domain Enums

- ASSET_CLASSES
- AREAS
- PROPERTY_STATUSES
- ARCHETYPES

## Design

### Proposed Architecture

```
app/
├── api/
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts
│   │   └── me/
│   │       └── route.ts
│   ├── blogs/
│   │   ├── route.ts (list/create)
│   │   ├── admin/
│   │   │   └── route.ts
│   │   └── [id]/
│   │       └── route.ts (get/update/delete by id)
│   ├── advisors/
│   │   ├── page/
│   │   │   └── route.ts (public list)
│   │   ├── admin/
│   │   │   └── route.ts (admin list)
│   │   └── [id]/
│   │       └── route.ts (get/update/delete by id)
│   ├── properties/
│   │   ├── route.ts (list with search, create)
│   │   ├── admin/
│   │   │   └── route.ts (admin list)
│   │   ├── [id]/
│   │   │   └── route.ts (get/update/delete by id)
│   │   └── [slug]/
│   │       └── route.ts (public get by slug)
│   ├── curations/
│   │   ├── route.ts (list/create)
│   │   ├── admin/
│   │   │   └── route.ts (admin list)
│   │   ├── [id]/
│   │   │   └── route.ts (get/update/delete by id)
│   │   └── [slug]/
│   │       └── route.ts (public get by slug)
│   ├── enquiries/
│   │   ├── route.ts (list/create)
│   │   └── [id]/
│   │       └── route.ts (update/delete by id)
│   ├── newsletter/
│   │   ├── route.ts (list/subscribe)
│   │   └── [id]/
│   │       └── route.ts (delete by id)
│   ├── uploads/
│   │   └── route.ts (file upload handler)
│   ├── settings/
│   │   ├── route.ts (get/update)
│   │   └── public/
│   │       └── route.ts (public get)
│   └── health/
│       └── route.ts (health check)
├── lib/
│   ├── supabase/
│   │   ├── client.ts (browser client)
│   │   └── server.ts (server-side client)
│   ├── auth/
│   │   ├── middleware.ts (auth middleware)
│   │   ├── types.ts (AuthUser type)
│   │   └── utilities.ts (token verification, user extraction)
│   ├── validation/
│   │   ├── middleware.ts (validation wrapper)
│   │   └── schemas.ts (Zod schemas for all DTOs)
│   └── constants/
│       └── enums.ts (ASSET_CLASSES, AREAS, PROPERTY_STATUSES, ARCHETYPES)
```

### Key Architectural Changes

#### Authentication Strategy

**Before (Nest.js):**
- JWT-based auth with `@UseGuards(AuthGuard)` on controllers
- `@Public()` decorator to bypass auth on specific routes
- `@CurrentUser()` decorator to extract user from JWT

**After (Next.js):**
- Supabase authentication with Next.js middleware for protected routes
- Server-side Supabase client to access authenticated user
- Custom `withAuth` wrapper for API routes requiring authentication
- Public routes accessible without authentication wrapper

```typescript
// Example: Protected API route
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Admin check for protected routes
  // ...
}
```

#### Validation Strategy

**Before (Nest.js):**
- Global ValidationPipe with class-validator
- 13 DTOs with validation decorators

**After (Next.js):**
- Zod schemas for request validation
- Custom validation middleware using `zod-to-ts` patterns

```typescript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// In route handler
const body = await request.json();
const result = LoginSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

#### Routing Strategy

**Before (Nest.js):**
- Controller-based routing with method decorators
- Global `/api` prefix
- Route parameters with `:` syntax

**After (Next.js):**
- File-system based routing in `/app/api/`
- Dynamic routes with `[param]` syntax
- No global prefix needed (inherent in file structure)

### Data Flow

1. Client sends request to `/api/[module]/[endpoint]`
2. Next.js middleware checks authentication (if required)
3. Route handler validates request using Zod schemas
4. Handler calls Supabase client for data operations
5. Response returned as JSON

### Error Handling

- Use try/catch blocks in each route handler
- Return consistent error response format: `{ error: string, details?: any }`
- Log errors to console/serverless logs
- Handle Supabase-specific errors appropriately

### File Upload Handling

**Before (Nest.js):**
- `FileInterceptor` from `@nestjs/platform-node`

**After (Next.js):**
- Use `formidable` or native Next.js file handling
- Process multipart/form-data in API route
- Upload to Supabase Storage

## Implementation Plan

### Phase 1: Project Setup
1. Create Next.js project structure
2. Install dependencies (zod, @supabase/supabase-js, etc.)
3. Set up Supabase client configuration
4. Configure TypeScript paths

### Phase 2: Core Infrastructure
1. Implement auth middleware/utilities
2. Create validation schemas from DTOs
3. Set up domain enums/constants
4. Create server-side Supabase client

### Phase 3: Module Migration (one by one)
For each module:
1. Create directory structure in `/app/api/`
2. Implement route handlers for each endpoint
3. Convert DTOs to Zod schemas
4. Migrate service logic to route handlers or lib/
5. Test endpoint behavior matches Nest.js version

### Phase 4: Frontend Integration
1. Update frontend API clients to use new endpoints
2. Test authentication flow end-to-end
3. Verify all features work with new backend

### Phase 5: Cleanup
1. Remove Nest.js backend directory
2. Remove Nest.js-related dependencies
3. Update documentation
4. Deploy

## Testing Strategy

### Unit Tests
- Test each API route handler independently
- Mock Supabase client for data operations
- Test validation schemas with valid/invalid inputs
- Test auth middleware with authenticated/unauthenticated requests

### Integration Tests
- Test auth flow (login, token refresh, logout)
- Test CRUD operations for each module
- Test file upload functionality

### End-to-End Tests
- Test critical user journeys:
  - User login → access protected resources
  - Admin login → access admin-only features
  - Property search → view property details
  - Contact form submission → data appears in enquiries

## Deployment Considerations

- Single Vercel deployment for frontend and backend
- Environment variables for Supabase credentials
- Serverless function cold starts (monitor and optimize if needed)
- API rate limiting (if not handled by Supabase)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data transformation differences | High | Thoroughly test each endpoint with real data |
| Auth flow breakage | High | Implement comprehensive auth tests |
| Performance degradation | Medium | Monitor cold starts and optimize route handlers |
| Missing DTO validation edge cases | Medium | Create comprehensive test cases for all validation scenarios |

## Success Criteria

1. All 28 endpoints functional and producing equivalent results to Nest.js version
2. No regression in existing functionality
3. Single deployment target (Vercel) for frontend and backend
4. Authentication and authorization working correctly
5. Validation working as expected for all API inputs
6. File uploads functioning correctly
7. Performance at least equivalent to Nest.js version