# 11 — Feature Enhancements (inspired by cwlagos.com)

> Five features folded into the Sterling Gates platform after researching
> [cwlagos.com](https://www.cwlagos.com) (CW Real Estate, "Lagos' leading luxury real
> estate brokerage"). Each is **adapted to the elite advisory positioning** — never a
> mass-market copy. Covers public + admin + data + API for every feature.

**Included (all requested):**
1. Property search & advanced filters
2. Neighbourhood pages
3. The Sterling Intelligence Brief — newsletter subscription
4. Curated collections
5. The Advisors (team) page

---

## 1. Property Search & Advanced Filters

### Public (`/properties`)
Filter bar above the grid, search-box + filters:
- **Keyword** (title, area, description, asset reference)
- **Asset class** — Residential / Commercial / Mixed-use
- **Location / area** — Eko Atlantic, Ikoyi, Victoria Island, Lekki Phase 1
- **Price range** — min/max (NGN or USD)
- **Status** — Available / Under Offer / Private
- **Toggle:** **Off-market only** (show placements otherwise invisible to the market)

All server-side via query params (keeps lists fast):
```
GET /api/properties?q=&assetClass=&area=&priceMin=&priceMax=&offMarket=true&page=&limit=
```

### Admin (`/admin/properties`)
Form gains `area`, `assetReference` (discreet `SG-####`), and `curation` tags
(see §4). No client-side filtering of large lists.

### Sorting
Published listings sort: featured first, then newest `publishedAt`. Price sort optional.

---

## 2. Neighbourhood Pages

You already operate in exactly the areas CW covers, so this is a natural fit.

### Public
- `/neighbourhoods` — index of areas: **Eko Atlantic · Ikoyi · Victoria Island ·
  Lekki Phase 1** (with local-intelligence blurb per market per the Brand Strategy §09).
- `/neighbourhoods/:slug` — area landing: on-brand intro copy, **published properties
  in that area** (reuse filtered `GET /api/properties?area=`), and local expertise
  guidance CTA → `/contact`.

### Data
- Property `area` field (string) drives area pages. No extra collection needed.
- Static per-area editorial copy lives in the frontend (brand-config), not in the admin.

### Note
Markets in the Brand Strategy extend beyond Lagos (global outlook); area pages cover the
Nigerian home markets first, global can be added later.

---

## 3. The Sterling Intelligence Brief — Newsletter Subscription

### Public
- **Newsletter capture** with an email field on the Home hero, footer, and the
  Intelligence section ("Request Access" / "Subscribe to the Brief").
- On submit → `POST /api/newsletter` → success toast + discreet confirmation.
- Optionally once subscribed, offer an unload-free transition to `/contact`.

### Backend
- **NewsletterModule**:
  - `POST /api/newsletter` (`@Public()`) — validate email, upsert into `subscribers`,
    return `201 { subscribed: true }`.
  - `GET /api/newsletter` (AdminGuard) — list subscribers; `DELETE /api/newsletter/:id`
    (AdminGuard) — remove.
- **Data (new collection `subscribers`):**
  | Field | Type | Notes |
  |-------|------|-------|
  | `email` | string | lowercased, unique |
  | `status` | string | `active` / `unsubscribed` |
  | `source` | string | `web` |
  | `createdAt` | timestamp | |
- Rate-limit per email/IP to avoid spam.

### Admin
- **Newsletter** area in the panel: subscriber count tile on Dashboard, table of
  subscribers, remove button. (Uses the same `GET /api/newsletter`.)

### Future hook
When the full Brief is built as a newsletter tool, `subscribers` becomes the mailing list.

---

## 4. Curated Collections

Curated views let the firm present themes, on-brand ("Private placements subject to
vetting", never "hot deals").

### Public
- `/curations` — index of collections.
- `/curations/:slug` — a collection of tags; renders matching **published** properties.
- Default collections (brand-authored copy):
  - **Off-Market Placements** (`offMarket: true`)
  - **Development Opportunities** (`assetClass: Development / curated tag`)
  - **Commercial Acquisitions** (`assetClass: Commercial`)

### Data
- Lightweight approach: a `curations` collection
  | Field | Type | Notes |
  |-------|------|-------|
  | `title` | string | on-brand title |
  | `slug` | string | unique |
  | `description` | string | editorial copy |
  | `filter` | object | map of property filters, e.g. `{ offMarket:true }` or `{ assetClass:"Commercial" }` |
  | `published` | boolean | |
- A curation = a saved filter; rendering calls `GET /api/properties` with that filter.

### API
- `GET /api/curations` (`@Public()`) — published curations + their filter.
- `GET /api/curations/admin` (AdminGuard); `POST / PATCH / DELETE` (AdminGuard).

### Admin
- **Curations** management: title, slug, description, a **filter builder** (choose
  asset class / area / off-market / status), published toggle.

---

## 5. The Advisors (Team) Page

### Public
- `/advisors` — grid of advisors with professional roles, short bios, and a private
  enquiry link. Fits the advisory positioning ("consultants, not agents").
- Optional deep-link `/advisors/:slug` for detail (discretion-first, no private numbers in public).

### Data (new collection `advisors`)
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | |
| `role` | string | e.g. "Head, Advisory" |
| `bio` | string | on-brand short bio |
| `photoUrl` | string | Storage URL |
| `focus` | string[] | e.g. Family Offices, Development |
| `published` | boolean | |
| `sortOrder` | number | |
| `createdAt` / `updatedAt` | timestamps | |

### API
- `GET /api/advisors` (`@Public()`) — published, ordered by `sortOrder`.
- `GET /api/advisors/admin` (AdminGuard); `POST / PATCH / DELETE` (AdminGuard);
  photo via existing `POST /api/uploads`.

### Admin
- **Advisors** management: name, role, bio, focus tags, photo upload, sort order,
  published toggle.

---

## Summary of plan delta (collections + endpoints added)

| Added | Data | API | Admin |
|-------|------|-----|-------|
| Filters | (property fields) `area`, `assetReference`, curation tags | query params on `GET /properties` | form fields in PropertyEditor |
| Neighbourhoods | static editorial + property `area` | reuse `GET /properties?area=` | — (area field only) |
| Newsletter | **`subscribers`** | `POST /newsletter`, `GET /newsletter`, `DELETE /newsletter/:id` | Newsletter screen + Dashboard tile |
| Curations | **`curations`** | `GET /curations`, CRUD admin | Curations screen |
| Advisors | **`advisors`** | `GET /advisors`, CRUD admin | Advisors screen |

**Updated files needed:** `05-database-schema.md` (§ add `subscribers`, `curations`,
`advisors`; property `area`/`assetReference`), `06-api-specification.md` (new endpoints),
`07-admin-panel-spec.md` (new admin screens), `08-public-site-spec.md` (new routes),
`01-project-brief.md` (new FRs), `build-plan.md` (new steps). Brand tone rules from
`02-brand-guide.md` still apply to all new copy.