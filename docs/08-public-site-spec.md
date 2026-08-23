# 08 — Public Site Specification

The public-facing marketing site. It is an evolution of `prototype.html`, reborn as a
Tailwind + React SPA with **live content**, plus new dynamic pages for **Properties** and
**Insights (Blog)**. Every visual and copy choice defers to `02 — Brand Guide`.

---

## 1. Brand baseline applied site-wide

- **Palette (Tailwind tokens):** `#111B18` emerald (base), `#8C764D` gold, `#E6CB85` brass
  (CTAs/highlights), `#F0EDE6` parchment (text), `#1a2b24` emerald-light (section banding).
- **Type:** Garamond/Cormorant for display headings; Georgia for editorial body; Inter
  (Helvetica-style) for labels, numbers, navigation.
- **Tone:** understated conviction, analytical sophistication, active discretion.
  Rule: no hype words, no clichés, off-market framing.
- **Tagline everywhere:** *Delivering Value. Building Legacies.*
- **Monogram:** interlocking "S"/"G" in a gold-bordered mark (keep the `SG` mark used in
  the prototype).

## 2. Shared components (React)

- `Nav` — fixed header; monogram + links; CTA "Private Enquiry"; mobile menu.
- `Footer` — brand, tagline, legal line (© 2026 … Confidential & Proprietary),
  WhatsApp/email contact from live settings.
- `SectionLabel` / `DisplayHeading` / `BodyText` — shared typography primitives.
- `Reveal` — IntersectionObserver scroll-in wrapper (photo borrowed from prototype).
- `PropertyCard` — title, location, price, status, hero image.
- `BlogCard` — cover image, title, excerpt, date, tag.
- `ContactCta` — repeated "Initiate Advisory" band.

## 3. Routes & sections

### 3.1 Home (`/`)
Multi-section one-pager largely mirroring the prototype's structure, powered by live data
where relevant:

1. **Hero** — eyebrow `London · Lagos · Global Outlook`; headline *"We do not simply trade
   square footage; we broker the legacy assets that endure."*; sub copy; CTAs
   **Initiate Advisory** + **Our Philosophy**; meta (Founded 2026 · Markets Global ·
   Focus Legacy Assets).
2. **Philosophy** — *"Stewardship over Transactions. Discretion as Currency."* + founder
   copy + the three brand pillars (Absolute Integrity, Elite Intelligence, Legacy
   Stewardship) with roman numerals I–III.
3. **Services** — the **11 disciplines** from `02 §9` as a responsive grid (Investment
   Advisory, Portfolio Strategy, Development Consultancy, Site Acquisition, Occupier &
   Tenant Rep, Due Diligence, Market Intelligence, International Sourcing, Project
   Marketing, Corporate RE Advisory, Wealth Planning Through Property).
4. **Client Archetypes** — three cards for Archetype A / B / C from `02 §10` with tags.
5. **Intelligence** — teaser for *The Sterling Intelligence Brief* + "Request Access" CTA.
6. **Featured Properties** — 3–4 `featured` listings pulled live from Firestore.
7. **Latest Insights** — 3 most recent published posts.
8. **Contact CTA** — *"Begin the conversation."* + button to `/contact`.

### 3.2 Properties (`/properties`)
- **Search & filter bar**: keyword, asset class, area (Eko Atlantic / Ikoyi / Victoria
  Island / Lekki Phase 1), price range, status, and an **"Off-market only"** toggle.
  Server-side via `GET /api/properties` query params (`11-feature-enhancements.md` §1).
- Grid of **published** properties with filter chips and a "Load more" pagination.
- Each `PropertyCard` links to `/properties/:slug`.

### 3.3 Property detail (`/properties/:slug`)
- Gallery (hero + images), title, location, area, **discreet asset reference**, status
  badge, price, key facts (bedrooms/bathrooms/size), features, on-brand description, and
  a discreet **"Private Enquiry"** CTA → `/contact?property=<slug>` (pre-fills message).

### 3.4 Insights (`/insights`)
- List of **published** posts (`GET /api/blogs`), newest first. Tag filter optional.
- Each card links to `/insights/:slug`.

### 3.5 Article detail (`/insights/:slug`)
- Cover image, title, author, date, tags, full **body**, plus a *"Request the brief"*
  CTA. Body styling uses the editorial Georgia type with generous measure.

### 3.6 Contact (`/contact`)
- **Enquiry form** (name, email, client archetype select, message) →
  `POST /api/enquiries`. Archetype select mirrors `02 §10` options.
- On success: confirmation + **"Continue on WhatsApp"** button (the returned `wa.me` link)
  and note that the email was sent.
- **Live contact number** from settings; direct **WhatsApp** and email links.
- **Locations:** Lagos (Eko Atlantic · Ikoyi · Victoria Island) and London (Mayfair ·
  Knightsbridge), with a global-outlook note.

### 3.7 Newsletter — The Sterling Intelligence Brief
- Email capture fields on the **Home hero**, **Footer**, and the **Intelligence** section
  ("Subscribe to the Brief") → `POST /api/newsletter` → confirmation.
- Full spec: `11-feature-enhancements.md` §3.

### 3.8 Neighbourhoods (`/neighbourhoods`, `/neighbourhoods/:slug`)
- Index + landing pages for **Eko Atlantic · Ikoyi · Victoria Island · Lekki Phase 1**
  (your core markets). Per-area editorial copy + published properties in that area via
  `GET /api/properties?area=`. CTA → `/contact`. Full spec: `11` §2.

### 3.9 Curations (`/curations`, `/curations/:slug`)
- Curated collections: **Off-Market Placements · Development Opportunities · Commercial
  Acquisitions**. A collection renders published properties matching its saved filter.
  Full spec: `11` §4.

### 3.10 The Advisors (`/advisors`)
- Grid of public advisor profiles (name, role, focus, bio, photo) from
  `GET /api/advisors`, each with a private enquiry link. Full spec: `11` §5.

---

## 4. Copy source-of-truth

Pull messaging verbatim from `02 — Brand Guide` §7 (elevator pitch, manifesto, value
proposition, client promise, mission/vision). Placeholder brand copy for Hero/Philosophy/
Services/Archetypes comes from `prototype.html` and is consistent with the guide.
Admin-authored property/blog copy is the admins' responsibility but must follow the tone
guardrails.

## 5. Performance & SEO (target ≥ 90 Lighthouse)

- `Vite` build → static assets on **Firebase Hosting CDN**.
- Lazy-load images below the fold; `loading="lazy"` and explicit width/height.
- Preconnect to Google Fonts; subset the Garamond/Inter families.
- Meta title/description per page; OpenGraph tags for Properties/Insights slugs.
- Public reads are direct Firestore Client SDK reads of **published** docs only
  (fast, cacheable), never the API — API is reserved for writes/enquiries/admin.

## 6. Accessibility

- Custom cursor feature kept only on coarse-pointer-safe breakpoints (per prototype).
- Semantic HTML, labelled form fields, visible focus states, Alt text on images,
  colour contrast within the palette (verify brass-on-emerald for text).
- Keyboard-navigable menus and the admin panel forms.