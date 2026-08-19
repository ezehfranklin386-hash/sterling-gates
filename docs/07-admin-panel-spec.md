# 07 — Admin Panel Specification

A password-protected React area under `/admin`. Purpose: **post blogs**, **post
properties**, **change the client contact number**, and review enquiries — without code.

Functional requirements delivered here (from the user's brief):

1. ✅ Admin can **post blogs**
2. ✅ Admin can **post properties**
3. ✅ Admin can **change the contact number** clients use to reach the firm

---

## 1. Access & security

- **Sign-in:** Firebase Auth (email/password, optionally Google).
- **Role gate:** NestJS AdminGuard verifies the Firebase ID token **and** the user's
  `role === "admin"` from Firestore (authoritative). The SPA also hides admin routes from
  non-admins, but the **server is the real gate**.
- **Routing guard (React):** an `<ProtectedRoute>` redirects `/admin/*` to `/admin/login`
  when no valid session.
- **Session:** store Firebase/user token in memory/localStorage; refresh on 401.

## 2. Layout

Consistent admin shell: top bar (Sterling Gates monogram + "Admin", user menu, Sign out),
collapsible sidebar — **Dashboard · Blogs · Properties · Enquiries · Newsletter ·
Curations · Advisors · Settings**. Visual
style follows `02 — Brand Guide` (emerald base, parchment text, gold accents) with a
functional admin aesthetic.

## 3. Screens

### 3.1 Dashboard (`/admin`)
KPI tiles: Count of published **Properties**, published **Blogs**, and **new Enquiries**.
Quick links to create a new blog / property. Read count from `GET /api/*/admin`.

### 3.2 Blogs (`/admin/blogs`)
- **List** (`GET /api/blogs/admin`): table of title (on-brand), status badge
  (Published / Draft), author, updated date; actions Edit / Publish·Unpublish / Delete.
- **Create / Edit** (form):
  - Title, slug (auto-generated from title, editable), excerpt, author, tags.
  - **Cover image** upload → `POST /api/uploads` → preview.
  - **Body** rich text editor (markdown or simple rich text).
  - **Published** toggle. Save → `POST /api/blogs` or `PATCH /api/blogs/:id`.
- **Delete** with confirmation.

### 3.3 Properties (`/admin/properties`)
- **List** (`GET /api/properties/admin`): title, location, asset class, price, status,
  featured/off-market flags, publish state; actions Edit / Publish·Unpublish / Delete.
- **Create / Edit** (form): title, slug, location, asset class, price + currency, status,
  bedrooms/bathrooms, size, description (on-brand copy — see `02`), features (add/remove
  chips), **image gallery** (upload multiple → Storage), **featured** and **offMarket**
  toggles, **Published** toggle.
- **Delete** with confirmation.

### 3.4 Enquiries (`/admin/enquiries`)
- Table of submissions (`GET /api/enquiries`): name, email, archetype, message preview,
  status (New / Followed up), date.
- Filter by status. Mark as followed up (`PATCH /api/enquiries/:id`).
- Copy a `wa.me` / mailto link to follow up manually.

### 3.5 Settings (`/admin/settings`) — *the contact-number requirement*
- Edit **Contact number** (`contactPhoneLabel` display + `contactPhone` for links) —
  live value read by the public site and the enquiry → WhatsApp flow.
- Edit **Admin email** (enquiry notifications).
- Toggles: **Email notifications**, **WhatsApp deep-link**.
- Save → `PUT /api/settings`. Show a preview of the resulting `wa.me` link.

### 3.6 Newsletter (`/admin/newsletter`) — Intelligence Brief subscribers
- Subscriber count tile on Dashboard.
- Table of subscribers (`GET /api/newsletter`): email, status, date.
- Remove / unsubscribe (`DELETE /api/newsletter/:id`).
- Full spec in `11-feature-enhancements.md` §3.

### 3.7 Curations (`/admin/curations`) — curated collections
- List; create / edit / delete. Fields per `11` §4: title, slug, description, and a
  **filter builder** (asset class / area / off-market / status), published toggle.
- Modeled on the saved-filter concept from cwlagos.com "Curations".

### 3.8 Advisors (`/admin/advisors`) — the team
- List; create / edit / delete. Fields: name, role, bio, focus tags, photo upload,
  sort order, published toggle. See `11` §5.

## 4. State & data access

- **API client:** typed `fetch` wrapper reading the base URL from env (`VITE_API_URL`).
- **State:** lightweight React Query / SWR for server state; local `Formik`-style form
  state is sufficient. No global store needed at this scale.
- **Toasts** for success/error feedback on every mutation.

## 5. Content rules (admin must follow)

- Copy in blogs & property descriptions must respect the **tone guardrails** in
  `02 — Brand Guide` (no hype adjectives; prefer "exceptional asset with strategic
  positioning" over "hot deal").
- Images should follow the art-direction rules (natural light, architectural, no
  clichés — agents pointing at keys, "For Sale" signs, etc.).
- The admin form can surface a gentle reminder banner linking to `02 — Brand Guide`.

## 6. Out of scope (future)

- Multiple admin roles / permissions granularity (single `admin` role now).
- Image cropping / transformation presets (store as-uploaded).
- Audit log of admin actions.