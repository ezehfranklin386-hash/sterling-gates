# 05 — Database Schema (Cloud Firestore)

Firestore is the single source of truth. All **writes** go through the NestJS API
(authoritative), not the browser. Public reads use the client SDK against `published`
documents only.

---

## 1. Collections overview

| Collection | Purpose | Public read? | Writes |
|-----------|---------|--------------|--------|
| `settings` | Single config doc (contact number, admin email, brand) | ✅ read | 🔒 NestJS (admin) |
| `blogs` | Insight / Intelligence Brief articles | ✅ published only | 🔒 NestJS (admin) |
| `properties` | Property listings | ✅ published only | 🔒 NestJS (admin) |
| `enquiries` | Submitted contact form submissions | ❌ (admin only) | ✅ public POST → NestJS |
| `users` | Admin user profiles & roles | ❌ (admin only) | 🔒 NestJS |
| `subscribers` | Intelligence Brief newsletter emails | ❌ (admin only) | ✅ public POST → NestJS |
| `curations` | Curated property collections (saved filters) | ✅ published only | 🔒 NestJS (admin) |
| `advisors` | Public team/advisors profiles | ✅ published only | 🔒 NestJS (admin) |

---

## 2. `settings` (single document: `settings/global`)

| Field | Type | Notes |
|-------|------|-------|
| `contactPhone` | string | International format, no spaces/`+`. e.g. `2348012345678` |
| `contactPhoneLabel` | string | Display label, e.g. `+234 801 234 5678` |
| `adminEmail` | string | Where enquiry emails are sent |
| `emailsEnabled` | boolean | Toggle email notification |
| `whatsappEnabled` | boolean | Toggle WhatsApp deep-link |
| `updatedAt` | timestamp | |

## 3. `users`

Single **admin** role this release (extensible to multiple).

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string (doc id) | Firebase Auth UID |
| `email` | string | |
| `name` | string | |
| `role` | string | `"admin"` — authoritative role source |
| `active` | boolean | Disable admin access if `false` |
| `createdAt` | timestamp | |

## 4. `blogs/:blogId`

An **Insights / Sterling Intelligence Brief** article.

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | |
| `slug` | string | unique, URL-safe (`url-safe-slug`) |
| `excerpt` | string | short summary for cards |
| `body` | string | article content (markdown or HTML) |
| `coverImageUrl` | string | Firebase Storage download URL |
| `author` | string | name/attribution |
| `tags` | string[] | e.g. `["Macro", "Capital Flows"]` |
| `published` | boolean | gates public visibility |
| `publishedAt` | timestamp | null if unpublished |
| `createdAt` / `updatedAt` | timestamps | |

## 5. `properties/:propertyId`

A curated property listing.

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | e.g. "Landmark Estate, Ikoyi" |
| `slug` | string | unique URL-safe |
| `location` | string | City / district, e.g. "Ikoyi, Lagos" |
| `area` | string | neighbourhood: `Eko Atlantic` \| `Ikoyi` \| `Victoria Island` \| `Lekki Phase 1` — drives neighbourhood pages |
| `assetReference` | string | discreet ref, e.g. `SG-08420` (inspired by CW property IDs) |
| `assetClass` | string | `Residential` \| `Commercial` \| `Development` \| `Land` (see `03` / frontend `AssetClass`) |
| `price` | number | display price in USD (frontend `formatPrice` defaults to USD) |
| `status` | string | lowercase `available` \| `under-offer` \| `sold` — matches `PropertyStatus` |
| `bedrooms` / `bathrooms` | number | nullable |
| `size` | object | `{ value: number, unit: "sqm" \| "sqft" }` |
| `description` | string | on-brand copy (see `02` guardrails) |
| `features` | string[] | amenities / highlights |
| `heroImageUrl` | string | primary/hero image URL (also shown as card image) |
| `imageUrls` | string[] | gallery URLs (hero + additional) — the frontend contract uses these two fields, __not__ a single `images` array |
| `featured` | boolean | pin to home showcase |
| `offMarket` | boolean | flags discreet/off-market placements |
| `published` | boolean | gates public visibility |
| `publishedAt` | timestamp | |
| `createdAt` / `updatedAt` | timestamps | |

## 6. `enquiries/:enquiryId`

One form submission.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | |
| `email` | string | |
| `archetype` | string | Sovereign / Family Office / Developer / Other |
| `message` | string | nature of enquiry |
| `status` | string | `"new"` \| `"followed_up"` |
| `source` | string | `"web"` |
| `createdAt` | timestamp | |

### 6.1 `subscribers/:id` — Intelligence Brief newsletter

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | lowercased, unique |
| `status` | string | `active` / `unsubscribed` |
| `source` | string | `web` |
| `createdAt` | timestamp | |

### 6.2 `curations/:curationId` — curated collections (saved filters)

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | on-brand title |
| `slug` | string | unique URL-safe |
| `description` | string | editorial copy |
| `filter` | object | saved property filter, e.g. `{ offMarket:true }`, `{ assetClass:"Commercial" }` |
| `published` | boolean | |
| `createdAt` / `updatedAt` | timestamps | |

### 6.3 `advisors/:advisorId` — public team profiles

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | |
| `role` | string | e.g. "Head, Advisory" |
| `bio` | string | on-brand short bio |
| `photoUrl` | string | Storage URL |
| `focus` | string[] | e.g. Family Offices, Development |
| `published` | boolean | |
| `sortOrder` | number | ordering |
| `createdAt` / `updatedAt` | timestamps | |

---

## 7. Firestore security rules (summary)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    // Public reads: published blogs & properties, global settings
    match /blogs/{id} {
      allow read: if resource.data.published == true;
      allow write: if false; // NestJS Admin SDK only
    }
    match /properties/{id} {
      allow read: if resource.data.published == true;
      allow write: if false; // NestJS Admin SDK only
    }
    match /settings/global {
      allow read: if true;
      allow write: if false; // NestJS Admin SDK only
    }
    // Enquiries: reads restricted; create via NestJS only
    match /enquiries/{id} {
      allow read, write: if false; // NestJS Admin SDK only
    }
    // Users: no direct client access
    match /users/{uid} { allow read, write: if false; }
  }
}
```

> Rationale: the NestJS API uses the **Firebase Admin SDK**, which bypasses security rules,
> so the rules only need to protect direct client access. Public reads are allowed on the
> published subset; the SPA never writes.

## 8. Seed data (created by setup script)

- `settings/global` — placeholder phone/email.
- `blogs` — 1–2 sample "Sterling Intelligence Brief" articles.
- `properties` — 2–3 sample on-brand listings (Ikoyi / Eko Atlantic).
- One admin user promotion (see `10 — Setup Guide`).