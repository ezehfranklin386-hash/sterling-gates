# 03 — Tech Stack (Architecture Decision Record)

Date: 2026-08-04 · Status: **Accepted** — no build yet.

This ADR records why we chose **Tailwind (React + Vite)**, **NestJS**, and **Firebase**
for the Sterling Gates platform, and the alternatives considered.

---

## 1. Summary of decisions

| Concern | Decision | Rationale (short) |
|---------|----------|-------------------|
| Frontend styling | **Tailwind CSS** | Rapid, design-token-friendly; maps cleanly onto the Brand palette |
| Frontend framework | **React + Vite** | Component re-use across public site & admin panel; fast dev server; static deploy |
| Backend API | **NestJS** | Structured, opinionated, typed; guards for authz; great middleware ecosystem |
| Backend platform | **Firebase** (Auth, Firestore, Storage) | Managed auth/session-free token verification, scalable NoSQL content store, image hosting |
| Hosting | **Firebase Hosting** (frontend) + NestJS on a Node runtime (Cloud Run / Render / Railway) | Static asset CDN + containerised API |
| Enquiry delivery | **Nodemailer** + **wa.me** links | No third-party SaaS lock-in; uses the admin-configured number |

## 2. Chosen stack — details

### 2.1 Frontend — React + Vite + Tailwind CSS
- Vite gives an instant dev server and lean production build (static files → Firebase Hosting CDN).
- Tailwind provides **design tokens** via `tailwind.config` colours matching the palette:
  `sterling.emerald #111B18`, `gates.gold #8C764D`, `brass #E6CB85`, `parchment #F0EDE6`.
- Single app with routes: public `/`, `/properties`, `/insights`, `/insights/:slug`,
  `/properties/:slug`, `/contact`, plus admin under `/admin`.

### 2.2 Backend — NestJS (REST API)
- Module-per-domain: `AuthModule`, `BlogsModule`, `PropertiesModule`, `SettingsModule`,
  `EnquiriesModule`.
- **Guards:** `AuthGuard` verifies Firebase ID token; `AdminGuard` checks the admin custom
  claim. Applied to every mutating/admin route.
- Serves as the **only** write path to Firestore (prevents client-side data tampering).

### 2.3 Platform — Firebase
- **Firebase Auth:** admins sign in (email/password or Google). The first admin is
  promoted by setting a custom claim `{ admin: true }` (bootstrap script).
- **Cloud Firestore:** NoSQL persistence. Collections: `users`, `settings`, `blogs`,
  `properties`, `enquiries`. Schema in `05 — Database Schema`.
- **Firebase Storage:** stores property and blog images; returns download URLs saved on
  the content documents.
- **Firebase Admin SDK** in NestJS (server-side) for verifying tokens and admin writes.

### 2.4 Email & WhatsApp (Enquiries)
- **Email:** NestJS uses Nodemailer to email the admin address on each enquiry.
- **WhatsApp:** the public "Chat on WhatsApp" link and the post-submit redirect use
  `https://wa.me/<admin_configured_number>?text=<encoded summary>`.
- The **contact number** lives in the Firestore `settings` document — the admin edits it
  in the panel (requirement), and both the frontend and the enquiry flow read it at runtime.

## 3. Alternatives considered & why rejected

| Alternative | Why not chosen |
|-------------|----------------|
| **Next.js (full-stack)** | Blend of SSR + NFT API overlaps with NestJS; heavier than needed for a content site; we keep the API layer explicitly separated. |
| **Supabase / Postgres** | Excellent, but Firebase matches the ask and gives managed auth + storage + instant offline-friendly caching in one platform. |
| **WordPress / Squarespace headless** | Lacks the custom NestJS admin-control requirement and per-feature backend logic. |
| **Mailchimp / Formspree** | Fine for forms, but requirement is a specific WhatsApp+email flow with a runtime-editable number — a small NestJS endpoint covers it without a third integration. |
| **Vue / Svelte** | Fine; React chosen for ecosystem maturity and shared component reuse across public + admin. |

## 4. Data flow (high level)

```
Visitor ──GET──▶ Vite SPA (Firebase Hosting CDN)
                    │  reads public Firestore directly (client SDK, read-only, public docs)
                    │
                    └──POST /enquiries──▶ NestJS ──▶ Firestore (enquiries)
                                            ├──▶ Nodemailer ──▶ Admin email
                                            └──▶ returns wa.me link ──▶ Admin WhatsApp

Admin ──sign-in──▶ Firebase Auth ──▶ NestJS AdminGuard (custom claim)
          └──CRUD blogs / properties / settings──▶ NestJS ──▶ Firestore + Storage
```

## 5. Risks & mitigations

- **Hybrid Firestore reads (client + server):** public data read directly by the SPA for
  speed; **all writes go through NestJS only** to prevent tampering. Mitigate by setting
  Firestore security rules to allow public reads on specific collections and deny direct
  writes.
- **Firebase custom claims timing:** claims can take time to propagate; admin guard reads
  fresh user record from Firestore `users`/`settings` role field as the authoritative
  source, not only the embedded claim.
- **Number portability:** WhatsApp numbers must be national/international format without
  "+" or spaces. Normalise in `SettingsService` before building `wa.me` links.

## 6. References

- Brand system → `02 — Brand Guide`
- Data model → `05 — Database Schema`
- API surface → `06 — API Specification`
- Local dev & deploy → `10 — Setup Guide`