# Sterling Gates Consultancy & Realty — Web Platform

> **Delivering Value. Building Legacies.**

This repository is the complete blueprint for the **Sterling Gates** production web
platform — an elite real estate advisory and consultancy firm headquartered in Lagos,
Nigeria, with a global outlook (London · Lagos · Global).

## What this is

A full project specification written as documentation, so the platform can be handed
to any developer (or built later) without ambiguity. The platform comprises:

- **Public website** — promotes the firm and its consultancy services (brand-driven,
  luxury aesthetic per the Brand Strategy), includes a live **Properties** showcase and
  an **Insights** blog.
- **Admin panel** — password-protected area where an admin can **post blogs**,
  **post properties**, and **change the client contact number**.
- **Enquiry system** — the public contact form delivers enquiries to the admin's
  **WhatsApp** and **email**, using a contact number stored in settings.

## Repository layout

| Path        | What it is                                       |
|-------------|--------------------------------------------------|
| `frontend/` | React + Vite + Tailwind SPA (public site + admin) |
| `backend/`  | NestJS REST API (serverless entry in `api/`)      |
| `supabase/` | SQL schema + setup/seed scripts                    |
| `docs/`     | Project specifications (see index below)           |

Both apps deploy to **Vercel** from this single repository: the backend builds with
Root Directory `backend` (serverless handler in `api/index.ts`), and the frontend
with Root Directory `frontend` (Vite static build → `dist/`). See `docs/10-setup-guide.md`.
## Tech stack (per project decision)

| Layer    | Technology |
|----------|-----------|
| Frontend | React + Vite + **Tailwind CSS** |
| Backend  | **NestJS** (REST API) |
| Platform | **Supabase** — Auth, Postgres, Storage |
| Email    | Nodemailer (via NestJS) |
| WhatsApp | wa.me deep links built from config |

## Documentation index

| Document | Description |
|----------|-------------|
| [01 — Project Brief](docs/01-project-brief.md) | Goal, scope, roles, user stories, success criteria |
| [02 — Brand Guide](docs/02-brand-guide.md) | Palette, typography, tone guardrails, messaging framework |
| [03 — Tech Stack](docs/03-tech-stack.md) | Architecture decision record + rationale |
| [04 — System Architecture](docs/04-system-architecture.md) | Components, data flow, diagram |
| [05 — Database Schema](docs/05-database-schema.md) | Firestore collections and fields |
| [06 — API Specification](docs/06-api-specification.md) | All NestJS endpoints |
| [07 — Admin Panel Spec](docs/07-admin-panel-spec.md) | Admin features and security |
| [08 — Public Site Spec](docs/08-public-site-spec.md) | Public pages/sections |
| [09 — Enquiry Workflow](docs/09-enquiry-workflow.md) | Contact → WhatsApp + email flow |
| [10 — Setup Guide](docs/10-setup-guide.md) | Local dev + deployment |
| [FE — Frontend Spec](docs/frontend-spec.md) | React + Vite + Tailwind build detail |
| [BE — Backend Spec](docs/backend-spec.md) | NestJS + Supabase build detail |
| [BUILD — Step-by-Step Plan](docs/build-plan.md) | Ordered build sequence, both sides |
| [11 — Feature Enhancements](docs/11-feature-enhancements.md) | Extra features inspired by cwlagos.com |

## Reading order

Start with **01 — Project Brief**, then **04 — System Architecture**, then read the
other docs as needed. **02 — Brand Guide** is the single source of truth for visuals
and copy tone — every UI decision must defer to it.

## Status

- [x] Project plan & requirements
- [x] Brand guide extracted from `Sterling_Gates_Brand_Strategy_v2.0 - Copy.pdf`
- [x] Architecture / schema / API / admin / site specs
- [x] **Frontend** and **Backend** build specs
- [ ] Application code (next phase, following `10 — Setup Guide`)

© 2026 Sterling Gates Consultancy & Realty. Confidential & Proprietary.
