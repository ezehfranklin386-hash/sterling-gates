# 10 — Setup Guide (Local Dev & Deployment)

How to stand up the Sterling Gates platform: Supabase project, NestJS backend, React+Vite
frontend, admin bootstrap, and deployment. Intended for the developer who builds this from
the specs.

---

## 0. Prerequisites

- Node.js **18+** (LTS) and npm.
- A **Supabase** project (free tier is fine). You need the project **URL** and the
  **anon key** (Dashboard → Settings → API) and the **service_role key** (never expose it
  client-side).
- A **Nodemailer**-compatible SMTP account (e.g. Gmail app password, Resend/SMTP2GO).
- The brand assets from `02 — Brand Guide` (palette already in Tailwind config spec).

---

## 1. Repo layout (recommended monorepo)

```
dan/
├── frontend/          # Vite + React + Tailwind (public + admin)
├── backend/           # NestJS API
├── supabase/          # schema.sql, setup.mjs, seed-admin.mjs, seed-content.mjs
└── docs/              # this documentation set
```

---

## 2. Supabase project setup

1. **Create a project** in the Supabase dashboard.
2. Run the one-command provisioning script from the repo root:

   ```bash
   cd backend && cp .env.example .env   # then fill in your Supabase credentials
   cd ../supabase && node setup.mjs
   ```

   `supabase/setup.mjs` is idempotent and does all of this:
   - applies `supabase/schema.sql` (tables, RLS, policies) via the Management API,
   - creates the public `images` storage bucket,
   - creates the admin Auth user + `app_users` row (role=admin) + global `settings` row,
   - seeds demo content (`properties`, `blogs`, `curations`, `advisors`) only into empty
     tables.

   It reads `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from `backend/.env` (or pass
   `--env` / `--email` / `--password` / `--phone` flags). Fallback without a PAT: paste
   `schema.sql` into the Dashboard SQL editor, then run `node seed-admin.mjs`.

---

## 3. Backend (NestJS) — local

```bash
cd backend
npm install
```

**Environment** (`backend/.env`, copy from `backend/.env.example`):
```
PORT=4000
SUPABASE_URL=...                    # plain project URL, e.g. https://xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...       # service role (server-side only)
SUPABASE_STORAGE_BUCKET=images
JWT_SECRET=...                      # app-level JWT for admin routes (long random string)
JWT_EXPIRES_IN=1h
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Sterling Gates <enquiries@sterlinggates.ng>
CORS_ORIGIN=http://localhost:5173   # comma-separated list for multiple origins
```

**Run:**
```bash
npm run start:dev     # http://localhost:4000/api
```

The backend uses the Supabase **service_role** client for all DB work; admin routes are
guarded by the app JWT issued at `POST /api/auth/login`. Enquiry emails are sent with
Nodemailer and are gracefully disabled if SMTP is not configured.

---

## 4. Frontend (React + Vite) — local

```bash
cd frontend
npm install
```

**Environment** (`frontend/.env`, copy from `frontend/.env.example`):
```
VITE_SUPABASE_URL=...               # plain project URL (NOT .../rest/v1/)
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:4000/api  # backend base URL — MUST include /api (client appends /settings, /blogs, ...)
```

**Run:**
```bash
npm run dev        # http://localhost:5173
```

Build pages per `08 — Public Site Spec`; admin per `07 — Admin Panel Spec`.

---

## 5. Bootstrap the first admin

The first admin cannot promote themselves (pre-launch setup). Use the focused script:

```bash
node supabase/seed-admin.mjs --email admin@sterlinggates.ng --phone 2348012345678
```

`supabase/seed-admin.mjs` creates the Supabase Auth user (email confirmed), upserts the
`app_users` row keyed by the auth `id` with `{ role: 'admin', active: true }`, and inserts
the global `settings` row (contact phone, admin email, `emails_enabled`,
`whatsapp_enabled`) if missing. (`supabase/setup.mjs` does the same plus schema + seed, so
you normally don't need to run this separately.)

> The admin check is authoritative on the backend: the SPA signs in via Supabase
> email/password, exchanges the access token at `POST /api/auth/login`, and the backend
> verifies the `app_users.role = 'admin'`.

---

## 6. Seed sample content (optional, recommended)

`supabase/setup.mjs` step 4 (or a manual `supabase/seed-content.mjs` run) writes 2–3
on-brand **properties** (Ikoyi, Eko Atlantic) and 1–2 **blogs** (Sterling Intelligence
Brief), refs `02 — Brand Guide` copy, `published:true`. Keeps the site non-empty on first
deploy. Only fills tables that are currently empty.

---

## 7. Enquiry → WhatsApp + email

- Ensure the `settings` row has a valid `contactPhone` and `adminEmail` (bootstrap step).
- Backend uses Nodemailer SMTP env vars (`09 — Enquiry Workflow`) to notify the admin and
  builds a `wa.me` link from `contactPhone` when `whatsappEnabled` is on.
- The public site reads settings for the number and WhatsApp CTA.

---

## 8. Deployment

The repo deploys as **two separate Vercel projects** (one per folder), each pinned by its
own `vercel.json`. There is intentionally no root `package.json` — nothing at the repo root
is deployed.

### 8.1 Frontend — project `sterling-gates`

- **Root Directory:** `frontend`
- Driven by `frontend/vercel.json`:
  ```json
  {
    "$schema": "https://openapi.vercel.sh/vercel.json",
    "buildCommand": "npm run build",
    "installCommand": "npm ci",
    "outputDirectory": "dist",
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- The rewrite makes every non-asset path fall back to `index.html` (SPA routing).
- **Project env vars (required):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_API_URL` — set each in the project settings (or `vercel env add NAME production`).
  `VITE_API_URL` must point at the **backend's** production URL **including the `/api`**
  suffix (e.g. `https://sterling-gates-backend.vercel.app/api`).

### 8.2 Backend — project `sterling-gates-backend`

- **Root Directory:** `backend`
- Driven by `backend/vercel.json` — builds `api/index.ts` with `@vercel/node` (a lazy
  NestJS bootstrap that reuses one Express instance per warm container) and routes all
  traffic to it:
  ```json
  {
    "builds": [{ "src": "api/index.ts", "use": "@vercel/node" }],
    "routes": [{ "src": "/(.*)", "dest": "api/index.ts" }]
  }
  ```
- Global prefix `api` is applied in `main.ts` / `api/index.ts`, so endpoints live under
  `https://<project>.vercel.app/api/...`.
- **Project env vars (required):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_STORAGE_BUCKET`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and SMTP + `CORS_ORIGIN`.

### 8.3 CLI deploy (recommended)

```bash
npx vercel login                # once per machine
cd frontend && npx vercel link  # creates/links "sterling-gates", root = frontend
npx vercel env add VITE_SUPABASE_URL production
# ... add the other env vars ...
npx vercel --prod

cd ../backend && npx vercel link
npx vercel env add SUPABASE_URL production
# ... add the other env vars ...
npx vercel --prod
```

Deploy **backend first**, then set the frontend's `VITE_API_URL` to the backend's
`https://<project>.vercel.app` URL before deploying the frontend.

---

## 9. Post-deploy smoke test (verification)

1. Public `/` loads with brand styling; contact number renders from settings.
2. **Admin:** sign in at `/admin/login` → create + publish a **blog**; it appears on
   `/insights`.
3. **Admin:** create + publish a **property**; it appears on `/properties` (and Home
   "Featured" if marked featured).
4. **Admin:** change the **contact number** in Settings; the Home contact and the
   successful-enquiry `wa.me` link now use the new number.
5. **Enquiry:** submit the public form → confirm the email arrives and the `wa.me` link /
   WhatsApp CTA points to the current number.
6. Unpublished blogs/properties are **not** visible publicly (API filters + owner policies
   work).
7. A non-admin / unauthenticated user gets `401/403` on admin API routes.

---

## 10. Env var checklist

| Env | Where | Purpose |
|-----|-------|---------|
| `SUPABASE_URL` | backend | Supabase REST/API base |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Server-side data access (never client) |
| `SUPABASE_STORAGE_BUCKET` | backend | Image upload bucket name |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | backend | App-JWT for admin routes |
| `SMTP_*` / `SMTP_FROM` | backend | Enquiry email |
| `CORS_ORIGIN` | backend | Allow frontend origin(s) |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | frontend | Supabase auth (admin sign-in) |
| `VITE_API_URL` | frontend | Backend base URL — MUST include `/api` |
| `settings` row (data) | Supabase | Contact number, admin email, toggles |