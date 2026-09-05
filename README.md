# Sterling Gates Platform

A Next.js application for Sterling Gates Consultancy & Realty.

## What this is

A full-stack platform built with Next.js, featuring:

- **API Routes** - Serverless API endpoints for all backend functionality
- **Supabase Integration** - Authentication, database, and storage
- **Admin Panel** - Protected admin interfaces (coming soon)
- **Public Website** - Property showcase and insights (coming soon)

## Repository Layout

| Path         | What it is                                              |
|--------------|---------------------------------------------------------|
| `app/`       | Next.js App Router (pages + API routes)                |
| `lib/`       | Shared utilities (Supabase client, auth, validation)   |
| `__tests__/` | API and unit tests                                      |
| `docs/`      | Project specifications and documentation                |
| `supabase/`  | SQL schema and setup/seed scripts                       |

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 15 (App Router) + React 18  |
| Backend  | Next.js API Routes + Supabase       |
| Styling  | Tailwind CSS                        |
| Database | Supabase Postgres                   |
| Auth     | Supabase Auth                       |
| Storage  | Supabase Storage                    |

## Setup

### Installation

```bash
npm install
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/advisors` - List advisors
- `GET /api/blogs` - List published blogs
- `GET /api/properties` - List available properties with search
- `GET /api/curations` - List published curations
- `GET /api/settings/public` - Public settings
- `POST /api/auth/login` - User login
- `POST /api/enquiries` - Submit enquiry
- `POST /api/newsletter` - Subscribe to newsletter
- `POST /api/uploads` - Upload file (requires auth)

### Protected Endpoints
- `GET /api/auth/me` - Get current user
- `POST /api/advisors` - Create advisor
- `PATCH /api/advisors/[id]` - Update advisor
- `DELETE /api/advisors/[id]` - Delete advisor
- And more admin endpoints in each module

## Deployment

Deploy to Vercel with zero configuration:

1. Connect your GitHub repository to Vercel
2. Add environment variables
3. Deploy

## Documentation

See the [docs](./docs) directory for complete project specifications.

---

> **Delivering Value. Building Legacies.**
