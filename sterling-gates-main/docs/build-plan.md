# BUILD — Step-by-Step Build Plan (Frontend + Backend)

> The ordered, actionable build sequence for the Sterling Gates platform. Run the phases
> in order; every phase ends with a "checkpoint" you must pass before moving on. Build
> docs referenced: `frontend-spec.md`, `backend-spec.md` (with `01`–`10` as the why).

**Total phases: 12 · Parallelisation:** Phase 3 (backend) and Phase 6 (frontend) can be
developed in parallel after Phase 0—2, but the frontend fully needs the API from Phase 3–5
for real integration. Recommended: build backend through Phase 5, then frontend.

---

## Phase 0 — Scaffold the monorepo

**Goal:** empty project shells for backend + frontend.

1. Create folder structure per `backend-spec.md` §1 and `frontend-spec.md` §1.
2. **Backend:** `npx @nestjs/cli new backend --strict` inside the repo.
   - `pnpm add @nestjs/config @nestjs/jwt firebase-admin nodemailer class-validator class-transformer multer @nestjs/platform-express`
   - `pnpm add -D @types/multer @types/nodemailer`
3. **Frontend:** `npm create vite@latest frontend -- --template react-ts`
   - `npm i react-router-dom firebase @tanstack/react-query formik`
   - `npm i -D tailwindcss postcss autoprefixer` then `npx tailwindcss init -p`
4. Configure Tailwind tokens + fonts per `frontend-spec.md` §2–3.
5. Add `frontend/tailwind.config.js`, `frontend/index.css`, wire `postcss.config.js`.

**Checkpoint:** both dev servers start; `npm run build` works; Tailwind classes apply;
`VITE_API_URL` and backend `.env` placeholders exist.

---

## Phase 1 — Firebase project setup

**Goal:** a Firebase backend to build against.

1. Create Firebase project; enable **Auth** (Email/Password [+ optional Google]),
   **Firestore** (production), **Storage**.
2. Download service-account → `backend/firebase-service-account.json` (git-ignored).
3. Copy web config → `frontend/.env` (`VITE_FIREBASE_*`) and project id → `backend/.env`.
4. Apply **security rules**: `firebase/firestore.rules` per `05-database-schema.md` §7
   (public reads of *published* docs only; no direct writes) and Storage read rules.
5. Add `.gitignore` entries: `firebase-service-account.json`, `.env`, `node_modules`, `dist`.

**Checkpoint:** `firebase emulators` (or console) shows Firestore/Storage/Auth available;
`firebase deploy --only firestore:rules,storage` applies cleanly.

---

## Phase 2 — Bootstrap backend plumbing

**Goal:** NestJS base + Firebase service + guards.

1. `app.module.ts` imports `ConfigModule.forRoot({ isGlobal:true })`.
2. Create `common/firebase/*` (module + service) per `backend-spec.md` §3.
3. Create `common/guards/auth.guard.ts` + `admin.guard.ts` and the `@Public()` /
   `@CurrentUser()` decorators (spec §4).
4. `main.ts`: global `ValidationPipe`, `/api` prefix, CORS (spec §2).

**Checkpoint:** `npm run start:dev` boots; a dummy `@Public()` health route returns 200;
an `AuthGuard`-protected route returns 401 without a token.

---

## Phase 3 — Auth + Settings modules (backend)

**Goal:** authentication + dynamic contact number.

1. **AuthModule** (`POST /api/auth/firebase`, `GET /api/auth/me`) per
   `backend-spec.md` §5 — verify ID token, resolve role from Firestore, return JWT.
2. **SettingsModule** per spec §6:
   - `GET /settings` (`@Public()`): public subset + `whatsappLink` (number normalised).
   - `PUT /settings` (AdminGuard): `UpdateSettingsDto` → `settings/global`.
3. Create the seed script `firebase/seed-admin.mjs` (from `10-setup-guide.md` §5) to make
   the first admin user + `settings/global`. Run it once.

**Checkpoint:** `curl POST /api/auth/firebase` with the seeded admin returns an
`accessToken`; `GET /api/settings` returns the number + `wa.me` link; `PUT /settings`
without a token → 401, with a non-admin token → 403.

---

## Phase 4 — Content modules: Blogs + Properties (backend)

**Goal:** full CRUD for the two content types.

1. **BlogsModule** (`backend-spec.md` §7): public `GET /blogs`, `GET /blogs/:slug`;
   admin `GET /blogs/admin`, `POST/PATCH/DELETE`. `CreateBlogDto`/`UpdateBlogDto`
   validating fields; slug uniqueness; auto `publishedAt`.
2. **PropertiesModule** (spec §8): public `GET /properties` (**+ search/filter query
   params**: `q`, `assetClass`, `area`, `priceMin/Max`, `status`, `offMarket` — see
   `11-feature-enhancements.md` §1), `GET /properties/:slug`; admin list +
   `POST/PATCH/DELETE`. Nested `size` DTO validation; add `area` + `assetReference` fields.
3. **AdvisorsModule** (§10.3) and **CurationsModule** (§10.2) — public reads + admin CRUD.
4. Wire modules into `app.module.ts`.

**Checkpoint:** published blogs/properties visible at their public endpoints; drafts only
on `/admin`; non-admins get 403 on all mutations.

---

## Phase 5 — Enquiries + Uploads modules (backend)

**Goal:** contact flow delivery.

1. **EnquiriesModule** (`backend-spec.md` §9): `POST /enquiries` (`@Public()`) → persist →
   Nodemailer email (failure non-fatal) → build `wa.me` link from settings; admin
   `GET /enquiries` + `PATCH /enquiries/:id`.
2. **NewsletterModule** (§10.1): `POST /newsletter` (`@Public()`, rate-limited) → upsert
   `subscribers`; admin `GET /newsletter` + `DELETE /newsletter/:id`.
4. **UploadsModule** (spec §10): `POST /uploads` (AdminGuard, multer) → Storage → URL.
5. `.env` keys for SMTP; test email transport with a throwaway address.

**Checkpoint:** POST a test enquiry → row in Firestore, email received, response includes
`whatsappLink` pointing at the settings number. Change the number in settings → new
submission uses the new number (the admin requirement works).

**→ At this point the backend is feature-complete.** Start the frontend.

---

## Phase 6 — Frontend scaffold + brand shell

**Goal:** app shell, routing, auth, API client.

1. `App.tsx` routes per `frontend-spec.md` §4; `main.tsx` with `QueryClientProvider`.
2. `lib/firebase.ts`, `lib/api.ts` (typed client, spec §6), `lib/format.ts`,
   `lib/queryClient.ts`.
3. `useAuth` + `ProtectedRoute` + `AdminLayout` (spec §5).
4. Shared brand components: `components/ui` (Button, Reveal, Tag, Toast, ConfirmDialog,
   Input/Textarea/Select), `components/cards/*`, `components/nav`, `components/footer`.
5. `useSettings`, `useBlogs`, `useProperties`, `useEnquiries` hooks.

**Checkpoint:** routes render on brand-styled shell; a debug admin-only route redirects to
`/admin/login` when unauthenticated; `useSettings` returns the contact number.

---

## Phase 7 — Public site (frontend)

**Goal:** all public pages live.

1. **Home** (`08-public-site-spec.md` §3.1): hero, philosophy, services, archetypes,
   intelligence, featured properties, latest insights, contact CTA.
2. **Properties** list + filter chips; **PropertyDetail** (`/properties/:slug`).
3. **Insights** list + **ArticleDetail** (`/insights/:slug`).
4. **Contact** (`08` §3.6 / `09-enquiry-workflow.md`): form → `submitEnquiry`, show
   `whatsappLink` + confirmation; live contact number + WhatsApp/email links from settings.
5. **Props filters** on `/properties` + **Neighbourhoods**, **Curations**, **Advisors**
   pages + **newsletter capture** (Home hero, footer, Intelligence) per
   `11-feature-enhancements.md` §1–5.
6. Static brand copy pulled from `02-brand-guide.md` §7/§9/§10.

**Checkpoint:** on the deployed/dev site, published properties + posts render; an enquiry
submits and returns the WhatsApp button with the correct number; unpublished items never
show publicly (test by setting one unpublished).

---

## Phase 8 — Admin panel (frontend)

**Goal:** all 4 admin requirements.

1. **AdminLogin** → Firebase sign-in → `POST /auth/firebase` → redirect to `/admin`.
2. **Dashboard**: 3 KPI tiles (blogs, properties, enquiries).
3. **BlogsAdmin + BlogEditor** (`07-admin-panel-spec.md` §3.2): list + create/edit with
   cover upload, published toggle, delete-with-confirm.
4. **PropertiesAdmin + PropertyEditor** (§3.3): full form, multi-image gallery, featured /
   offMarket / published toggles.
5. **EnquiriesAdmin** (§3.4): list, filter by status, mark followed-up, copy `wa.me`.
6. **NewsletterAdmin, CurationsAdmin, AdvisorsAdmin** (§3.6–3.8): manage subscribers,
   curated collections (filter builder), and advisor profiles.
7. **SettingsAdmin** (§3.5): edit contact number (display + link forms), admin email,
   toggles, live `wa.me` preview.

**Checkpoint:** as admin you can (a) publish a blog → appears on `/insights`, (b) publish a
property → appears on `/properties`, (c) change the contact number → the public contact and
next `wa.me` link use it. Non-admin/expired token cannot reach any admin route/API.

---

## Phase 9 — Seed, polish, verify

**Goal:** non-empty site + quality pass.

1. Run `firebase/seed-content.mjs` (sample on-brand properties + blogs).
2. Add meta/OG tags and lazy-loading per `08-public-site-spec.md` §5.
3. Run the **post-deploy smoke test** from `10-setup-guide.md` §9 (all 7 checks).
4. Pass the visual acceptance checklist in `frontend-spec.md` §11 (brand fidelity).

**Checkpoint:** all 7 smoke-test steps green; Lighthouse ≥ 90; admin + public flows complete.

---

## Phase 10 — Deploy

**Goal:** production live.

1. **Backend:** `Dockerfile` → Cloud Run / Render / Railway with env vars + service-account
   (`10-setup-guide.md` §8.1).
2. **Frontend:** `npm run build` → `dist/` → Firebase Hosting or Netlify (§8.2).
3. Deploy rules (§8.3). Re-run the smoke test against the production URL.

**Checkpoint:** public site live, admin reachable, enquiry lands in WhatsApp + email with
the current number.

---

## Phase 11 — Feature Enhancements (inspired by cwlagos.com)

**Goal:** add the 5 features from `11-feature-enhancements.md`. Each is already wired into
Phases 4 (backend content), 5 (newsletter), 7 (public), and 8 (admin); this phase is where
you **build and verify them as discrete, shippable increments**.

### 11.1 Property search & advanced filters
1. **Backend** — extend `GET /api/properties` to accept `q`, `assetClass`, `area`,
   `priceMin`, `priceMax`, `status`, `offMarket`, plus pagination (`11` §1).
2. **Data** — ensure properties carry `area` + `assetReference`; seed across the areas.
3. **Frontend** — build the filter bar on `/properties` (keyword, asset class dropdown,
   area, price min/max, status, off-market toggle), keep state in the URL for shareability.
4. **Admin** — add `area` + `assetReference` inputs to `PropertyEditor`.
**Checkpoint:** filters return the correct subset; off-market toggle hides non-off-market
listings; URL reflects the active filters.

### 11.2 Neighbourhood pages
1. **Frontend** — add `/neighbourhoods` index + `/neighbourhoods/:slug` landing pages for
   Eko Atlantic, Ikoyi, Victoria Island, Lekki Phase 1 (`11` §2).
2. Pull per-area copy from the Brand Strategy (§09) into brand-config.
3. Wire area pages to `GET /api/properties?area=`; each shows its published listings +
   a local-expertise CTA → `/contact`.
**Checkpoint:** each area page lists only its own properties and renders on-brand copy.

### 11.3 Intelligence Brief newsletter
1. **Backend** — `NewsletterModule`: `POST /newsletter` (rate-limited, upsert by email),
   admin `GET /newsletter`, `DELETE /newsletter/:id`; add `subscribers` collection (`11` §3).
2. **Frontend** — newsletter capture on Home hero, footer, and the Intelligence section;
   success toast on subscribe.
3. **Admin** — subscriber count tile + `/admin/newsletter` list/remove screen.
**Checkpoint:** a test email subscribes (appears in `subscribers` + admin list) and a dup
subscription does not duplicate.

### 11.4 Curated collections
1. **Backend** — `CurationsModule`: public `GET /curations` + admin CRUD; `curations`
   collection holds a saved `filter` (`11` §4).
2. **Frontend** — `/curations` index + `/curations/:slug`; a collection renders published
   properties matching its filter via `GET /api/properties?<filter>`.
3. **Admin** — `/admin/curations` with a **filter builder** (asset class / area /
   off-market / status) + published toggle.
**Checkpoint:** editing a collection's filter changes what its public page shows.

### 11.5 The Advisors (team)
1. **Backend** — `AdvisorsModule`: public `GET /advisors` (ordered by sortOrder) + admin
   CRUD; `advisors` collection (`11` §5). Photos via existing `POST /uploads`.
2. **Frontend** — `/advisors` grid (name, role, focus, bio, photo) with a private enquiry
   link per advisor.
3. **Admin** — `/admin/advisors` create/edit/delete with photo upload + sort order.
**Checkpoint:** publishing an advisor makes them appear on `/advisors`; drafts stay hidden.

**Phase 11 checkpoint:** all five verification steps above pass; the public site lets
visitors search/filter, browse neighbourhoods & curations, subscribe to the Brief, and see the
team — while admins edit every one of these in the panel.

---

## Delivery order / parallelisation note

- **Strictly sequential:** Phases 0→1→2 (foundations). Phase 3 must precede Phase 5
  frontend (needs settings + auth).
- **Can parallelise:** Phase 3–5 (backend) with Phase 6 (frontend shell) — but full
  frontend data flows wait on backend/Phase 7.
- **Cheapest safe path:** complete backend (0–5) → frontend (6–8) → ship (9–10).