# 04 — System Architecture

High-level overview of the Sterling Gates platform: components, how they talk, and the
two flows that matter (public browse, and admin content management).

---

## 1. Component map

```
┌────────────────────────────────────────────────────────────────┐
│                        BROWSER (single SPA)                      │
│  React + Vite + Tailwind                                        │
│                                                                  │
│  PUBLIC:                    ADMIN (/admin, guarded):             │
│  ┌────────┐ ┌──────────┐   ┌─────────┐ ┌──────────┐            │
│  │  Home  │ │Properties│   │  Login  │ │  Blogs   │            │
│  └────────┘ └──────────┘   └─────────┘ └──────────┘            │
│  ┌────────┐ ┌──────────┐   ┌─────────┐ ┌──────────┐            │
│  │Insights│ │  Contact │   │Properties││ Settings │            │
│  └────────┘ └──────────┘   └─────────┘ └──────────┘            │
└───────┬───────────────────────┬────────────────────────────────┘
        │ public reads (Firestore Client SDK, read-only)
        ▼                       ▼ sign-in (Admin)
┌───────────────────────────────────────────────────────────────┐
│                     FIREBASE                                   │
│  • Auth .............. admin identity / custom claim (admin)  │
│  • Firestore ......... users, settings, blogs, properties,    │
│                        enquiries                              │
│  • Storage ........... property & blog images                 │
│  • Hosting ........... serves the built SPA (CDN)             │
└───────┬───────────────────────────────────────────────────────┘
        │ writes (SERVICE/ADMIN ACCOUNT, only via NestJS)
        ▼
┌───────────────────────────────────────────────────────────────┐
│                     NESTJS API (container)                     │
│  AuthModule       BlogsModule      PropertiesModule            │
│  SettingsModule   EnquiriesModule                             │
│  • AdminGuard (Bearer Firebase ID token + admin role)         │
│  • Nodemailer → admin email                                   │
│  • wa.me link builder                                         │
└───────────────────────────────────────────────────────────────┘
```

## 2. Frontend — public routes

| Route | Purpose | Data source |
|-------|---------|-------------|
| `/` | Marketing home: hero, philosophy, pillars, services, client archetypes, intelligence brief teaser, contact CTA | Static brand copy + live settings (contact number) |
| `/properties` | Curated property showcase | Firestore `properties` (published only) |
| `/properties/:slug` | Property detail | Firestore `properties/:id` |
| `/insights` | Blog listing (The Sterling Intelligence Brief) | Firestore `blogs` (published only) |
| `/insights/:slug` | Article detail | Firestore `blogs/:id` |
| `/contact` | Enquiry form + WhatsApp link + locations | Static + live settings number |

## 3. Frontend — admin routes (`/admin/*`, guarded)

| Route | Purpose |
|-------|---------|
| `/admin/login` | Firebase Auth sign-in |
| `/admin` | Dashboard (stats: live properties, posts, unread enquiries) |
| `/admin/blogs` · `/admin/blogs/:id` | List / create / edit / delete blog posts |
| `/admin/properties` · `/admin/properties/:id` | List / create / edit / delete properties |
| `/admin/enquiries` | View submitted enquiries |
| `/admin/settings` | Edit client contact number (+ admin email) |

## 4. Backend modules & responsibilities

### AuthModule
- `POST /auth/firebase` — verify Firebase ID token server-side, exchange for an app
  session/JWT that carries the admin role.
- Determines admin from Firestore `users`/`settings` role (authoritative), not only the
  token claim.

### BlogsModule — `05 schema` · `06 API`
- Serves published posts publicly; full CRUD behind admin guard.
- Publishes/unpublishes; stores image refs.

### PropertiesModule
- Serves published properties publicly; full CRUD behind admin guard.
- Fields per `05` (title, location, price, description, images, status).

### SettingsModule
- `GET /settings` (public) — returns the **current contact number** + WhatsApp link.
- `PUT /settings` (admin) — updates contact number / admin email.

### EnquiriesModule
- `POST /enquiries` (public) — validate, persist, notify.
- `GET /enquiries` (admin) — list.
- Persists to Firestore, emails admin, returns `wa.me` link.

## 5. Security posture

- **All writes via NestJS only.** The SPA never writes Firestore directly.
- **Firestore rules:** allow public **reads** of `blogs`, `properties`, `settings`
  (published subset only); allow **writes** only for a service/admin path that NestJS uses
  (or a locked-down claim). Simplest safe rule: deny all direct client writes; NestJS uses
  the Firebase Admin SDK (bypasses rules).
- **Admin guard:** every admin endpoint requires a verified Firebase ID token **and** an
  admin role resolved from Firestore. 401 on missing/invalid, 403 on non-admin.
- **Validation:** class-validator DTOs on every body; size limits on image uploads.

## 6. Deployment topology

1. **Firebase Hosting** (or Netlify) serves the built `dist/` of the Vite SPA — global CDN.
2. **NestJS** runs on a Node container (Cloud Run / Render / Railway) with env vars for the
   Firebase service account, admin email, and SMTP credentials.
3. **Firebase project** owns Auth, Firestore, Storage. Seed the first admin via bootstrap.

## 7. Cross-cutting concerns

- **Brand tokens:** Tailwind config maps exactly to `02 — Brand Guide` palette; fonts loaded
  per `02` (Garamond family + Inter).
- **Publishing discipline:** `published: true` gates public visibility for blogs/properties.
- **Seed content:** `10 — Setup Guide` documents seeding sample services, archetypes, one
  property and one post so the site is never empty.