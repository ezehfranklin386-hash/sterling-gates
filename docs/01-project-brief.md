# 01 — Project Brief (PRD)

Sterling Gates Consultancy & Realty — Web Platform.

- **Version:** 1.0 (Planning)
- **Status:** Approved for build
- **Owner:** Executive Leadership Team (Brand Committee)
- **Source:** `Sterling_Gates_Brand_Strategy_v2.0 - Copy.pdf` (the Brand Master Blueprint)

---

## 1. Purpose & Problem

Sterling Gates is an elite real estate advisory and consultancy firm that partners with
ultra-high-net-worth individuals, family offices, and institutions to **preserve capital,
optimise portfolios, and secure generational legacy assets** through unmatched strategic
intelligence.

Today the firm has a static promotional prototype (`prototype.html`). There is no living
web presence that:

- Lets clients **discover** the firm and its consultancy services.
- Shows **live properties** and **publishing** (blogs/insights).
- Lets an **admin update content** without touching code.
- Routes **client enquiries** to the firm's real communication channels.

This project builds that production platform. It is **not** a conventional listing portal;
it is a luxury, discretion-first corporate presence guided by the Brand Strategy.

## 2. Goals

1. Give the firm an authoritative, on-brand public web presence.
2. Turn consultancy services, client focus, and thought leadership into browsable content.
3. Allow the firm to **publish properties and blogs** through a secure admin panel.
4. Allow admins to **change the client contact number** in one place.
5. Route every enquiry to **admin WhatsApp and email** with full detail captured.

## 3. Non-Goals (this release)

- Payment / transaction processing.
- Public user accounts or a client portal login.
- Multi-language support (English only initially).
- Booking/calendaring of advisory consultations.
- Mass-market MLS/listing syndication (explicitly against brand: off-market, quiet).

## 4. Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Visitor** | Anonymous web visitor | Read public pages, view properties, read blogs, submit an enquiry |
| **Admin** | Firm staff (single admin role; can scale to multiple users) | Sign in, manage blogs, manage properties, edit site contact number, view enquiries |

## 5. User Stories

### Public (Visitor)
- As a **visitor**, I want to learn who Sterling Gates is and why they are different, so I
  can decide whether to engage. (Philosophy / About)
- As a **visitor**, I want to see the firm's consultancy services, so I understand what
  they advise on.
- As a **visitor**, I want to browse a curated **Properties** showcase, so I can see the
  calibre of assets and off-market positioning.
- As a **visitor**, I want to read **Insights** (blog), so I follow the firm's thought
  leadership (The Sterling Intelligence Brief).
- As a **visitor**, I want a discreet contact form, so I can enquire privately.

### Admin
- As an **admin**, I want to sign in securely, so only authorised staff can manage content.
- As an **admin**, I want to **create, edit, publish/unpublish, and delete blog posts**.
- As an **admin**, I want to **create, edit, publish/unpublish, and delete property
  listings** (with images, price, location, description).
- As an **admin**, I want to **change the contact number** that the public site and the
  enquiry flow use, without a developer.
- As an **admin**, I want to **view submitted enquiries**, so I can follow up on WhatsApp/email.

## 6. Functional Requirements

- **FR-1** Public marketing site (hero, philosophy, services, audience, intelligence, contact).
- **FR-2** Curated Properties listing + individual property detail.
- **FR-3** Insights/Blog listing + individual post detail.
- **FR-4** Enquiry form → persisted + emailed + WhatsApp deep-link.
- **FR-5** Admin authentication (single admin role via Firebase custom claims).
- **FR-6** Admin: blogs CRUD.
- **FR-7** Admin: properties CRUD.
- **FR-8** Admin: edit site settings (contact number).
- **FR-9** Admin: view enquiries.
- **FR-10** Property search & advanced filters (asset class, area, price, off-market toggle).
- **FR-11** Neighbourhood pages (Eko Atlantic, Ikoyi, Victoria Island, Lekki Phase 1).
- **FR-12** The Sterling Intelligence Brief newsletter subscription (collect + manage emails).
- **FR-13** Curated property collections (Off-Market, Development, Commercial).
- **FR-14** The Advisors (team) page with public profiles.

> These five (FR-10…14) were added from research of `cwlagos.com` — see
> `11-feature-enhancements.md` for the full spec of each.

## 7. Non-Functional Requirements

- **Brand fidelity:** colours, typography and tone MUST follow `02 — Brand Guide`.
- **Performance:** Lighthouse scores target ≥ 90 for the public site (lazy-load images,
  static hosting, preconnect to fonts).
- **Security:** admin routes protected server-side (NestJS guards) **and** client-side;
  input validation on all writes; Firebase token verification on every admin request.
- **Discretion:** public pages must not leak private enquiries or unpublished content.
- **Durability:** content lives in Firestore; images in Firebase Storage.

## 8. Success Criteria

1. An admin can publish a blog and a property, and change the contact number, end-to-end.
2. A visitor can submit an enquiry that reaches the admin's WhatsApp and email.
3. The public site is visually consistent with the Brand Strategy (verified against
   `02 — Brand Guide`).
4. Deployment is repeatable following `10 — Setup Guide`.

## 9. Out of Scope / Future

- Per-archetype member-only dossier portal (Brand Strategy proposes encrypted digital
  dossiers for curated off-market briefings) — future phase.
- The Sterling Intelligence Brief as a password-protected subscriber area.
- Executive roundtable registration.