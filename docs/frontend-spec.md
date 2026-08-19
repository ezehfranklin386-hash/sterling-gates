# FE — Frontend Build Spec (React + Vite + Tailwind)

> Public site + Admin panel in a single React application, styled with Tailwind using the
> Sterling Gates brand tokens (see `02-brand-guide.md`). All copy tone rules apply.

- Stack: **React 18**, **Vite**, **Tailwind CSS 3**, **react-router-dom 6**, **firebase/js**
  (client SDK), **@tanstack/react-query**, optional **Formik**.
- Base: `frontend/` (monorepo sibling to `backend/`).

---

## 1. Directory structure

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env                        # VITE_FIREBASE_* , VITE_API_URL
├── src/
│   ├── main.tsx                # React root, router, QueryClientProvider
│   ├── App.tsx                 # Route definitions (public + /admin/*)
│   ├── index.css               # Tailwind directives + font/base styles
│   ├── lib/
│   │   ├── firebase.ts         # initializeApp + getAuth (client SDK)
│   │   ├── api.ts              # typed fetch wrapper (VITE_API_URL)
│   │   ├── queryClient.ts      # React Query client config
│   │   └── format.ts           # currency / date / number formatting
│   ├── hooks/
│   │   ├── useSettings.ts      # GET /api/settings (React Query)
│   │   ├── useBlogs.ts         # list/single queries + mutations
│   │   ├── useProperties.ts    # list/single queries + mutations
│   │   ├── useEnquiries.ts     # admin list/mark followed up
│   │   └── useAuth.ts          # sign-in, token management, admin guard
│   ├── components/
│   │   ├── brand/              # Monogram, SectionLabel, DisplayHeading, BodyText
│   │   ├── nav/                # Navbar, MobileMenu
│   │   ├── footer/             # Footer
│   │   ├── cards/              # PropertyCard, BlogCard, ServiceCard, ArchetypeCard
│   │   ├── ui/                 # Reveal, Button (brass/parchment variants), Tag,
│   │   │                       # Toast, ConfirmDialog, Input/Textarea/Select
│   │   └── admin/              # AdminLayout, ProtectedRoute, Sidebar, StatTile,
│   │                           # EnquiryRow, ImageUploader
│   ├── pages/
│   │   ├── public/             # Home, Properties, PropertyDetail,
│   │   │                       # Insights, ArticleDetail, Contact
│   │   └── admin/              # AdminLogin, Dashboard, BlogsAdmin, BlogEditor,
│   │                           # PropertiesAdmin, PropertyEditor,
│   │                           # EnquiriesAdmin, SettingsAdmin
│   └── assets/
```

---

## 2. Tailwind config — brand tokens (from `02`)

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald:  { DEFAULT: '#111B18', light: '#1a2b24' },
        gold:     '#8C764D',
        brass:    '#E6CB85',
        parchment:'#F0EDE6',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],  // Didot/Garamond tier
        serif:  ['Georgia', 'Times New Roman', 'serif'],       // editorial tier
        sans:   ['Inter', 'Helvetica Neue', 'sans-serif'],     // data/label tier
      },
      letterSpacing: { 'wide-xl': '0.4em' },
    },
  },
  plugins: [],
};
```
Load **Cormorant Garamond** + **Inter** via Google Fonts `index.html` (preconnect).

---

## 3. Global styles (`index.css`)

```css
@tailwind base; @tailwind components; @tailwind utilities;

:root { color-scheme: dark; }
body {
  @apply bg-emerald text-parchment font-sans antialiased;
}
/* Display headings */
.display { @apply font-display font-light leading-tight tracking-tight; }
/* Eyebrow labels: uppercase, tracked-out, gold */
.eyebrow { @apply text-gold uppercase tracking-wide-xl text-[0.65rem]; }
```

---

## 4. Routing (`App.tsx`)

```tsx
<Routes>
  {/* Public */}
  <Route path="/" element={<Home/>} />
  <Route path="/properties" element={<Properties/>} />
  <Route path="/properties/:slug" element={<PropertyDetail/>} />
  <Route path="/insights" element={<Insights/>} />
  <Route path="/insights/:slug" element={<ArticleDetail/>} />
  <Route path="/contact" element={<Contact/>} />
  <Route path="/neighbourhoods" element={<Neighbourhoods/>} />
  <Route path="/neighbourhoods/:slug" element={<NeighbourhoodDetail/>} />
  <Route path="/curations" element={<Curations/>} />
  <Route path="/curations/:slug" element={<CurationDetail/>} />
  <Route path="/advisors" element={<Advisors/>} />

  {/* Admin, protected */}
  <Route path="/admin/login" element={<AdminLogin/>} />
  <Route path="/admin" element={<ProtectedRoute/>}>
    <Route path="" element={<Dashboard/>} />
    <Route path="blogs" element={<BlogsAdmin/>} />
    <Route path="blogs/:id" element={<BlogEditor/>} />
    <Route path="properties" element={<PropertiesAdmin/>} />
    <Route path="properties/:id" element={<PropertyEditor/>} />
    <Route path="enquiries" element={<EnquiriesAdmin/>} />
    <Route path="newsletter" element={<NewsletterAdmin/>} />
    <Route path="curations" element={<CurationsAdmin/>} />
    <Route path="advisors" element={<AdvisorsAdmin/>} />
    <Route path="settings" element={<SettingsAdmin/>} />
  </Route>
</Routes>
```

---

## 5. Auth (`lib/firebase.ts`, `hooks/useAuth.ts`)

- `useAuth` exposes `{ user, admin, signIn(email,pass), signOut(), loading, error }`.
- On sign-in: get Firebase **ID token** → `POST /api/auth/firebase` → store returned
  `accessToken` + profile. `admin` is true when `role === 'admin'`.
- `api.ts` attaches the `accessToken` as `Authorization: Bearer <token>`.
- On `401`, invalidate session and redirect to `/admin/login`.
- **`ProtectedRoute`**: if `loading` → spinner; if not `admin` → `<Navigate to="/admin/login">`;
  else render `<AdminLayout/><Outlet/>`.

---

## 6. API client (`lib/api.ts`)

```ts
const base = import.meta.env.VITE_API_URL;
async function request<T>(path, { method='GET', body, token }: {...} = {}): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  return res.json();
}
export const api = {
  getSettings: () => request<Settings>(`/settings`),
  updateSettings: (b, t) => request<Settings>(`/settings`, { method:'PUT', body:b, token:t }),
  listBlogs: (p?) => request<{items:Blog[],total:number}>(`/blogs` + qs(p)),
  getBlog: (slug) => request<Blog>(`/blogs/${slug}`),
  adminBlogs: (t) => request<Blog[]>(`/blogs/admin`, { token:t }),
  createBlog: (b,t) => request<Blog>(`/blogs`, { method:'POST', body:b, token:t }),
  updateBlog: (id,b,t) => request<Blog>(`/blogs/${id}`, { method:'PATCH', body:b, token:t }),
  deleteBlog: (id,t) => request<void>(`/blogs/${id}`, { method:'DELETE', token:t }),
  listProperties: (p?) => request<{items:Property[],total:number}>(`/properties` + qs(p)), // q, assetClass, area, priceMin/Max, offMarket, status
  getProperty: (slug) => request<Property>(`/properties/${slug}`),
  subscribeNewsletter: (email) => request<{subscribed:boolean}>(`/newsletter`, { method:'POST', body:{ email } }),
  listNewsletter: (t) => request<Subscriber[]>(`/newsletter`, { token:t }),
  removeSubscriber: (id,t) => request<void>(`/newsletter/${id}`, { method:'DELETE', token:t }),
  listCurations: () => request<{items:Curation[]}>(`/curations`),
  adminCurations: (t) => request<Curation[]>(`/curations/admin`, { token:t }),
  createCuration: (b,t) => request<Curation>(`/curations`, { method:'POST', body:b, token:t }),
  updateCuration: (id,b,t) => request<Curation>(`/curations/${id}`, { method:'PATCH', body:b, token:t }),
  deleteCuration: (id,t) => request<void>(`/curations/${id}`, { method:'DELETE', token:t }),
  listAdvisors: () => request<{items:Advisor[]}>(`/advisors`),
  adminAdvisors: (t) => request<Advisor[]>(`/advisors/admin`, { token:t }),
  createAdvisor: (b,t) => request<Advisor>(`/advisors`, { method:'POST', body:b, token:t }),
  updateAdvisor: (id,b,t) => request<Advisor>(`/advisors/${id}`, { method:'PATCH', body:b, token:t }),
  deleteAdvisor: (id,t) => request<void>(`/advisors/${id}`, { method:'DELETE', token:t }),
  adminProperties: (t) => request<Property[]>(`/properties/admin`, { token:t }),
  createProperty: (b,t) => request<Property>(`/properties`, { method:'POST', body:b, token:t }),
  updateProperty: (id,b,t) => request<Property>(`/properties/${id}`, { method:'PATCH', body:b, token:t }),
  deleteProperty: (id,t) => request<void>(`/properties/${id}`, { method:'DELETE', token:t }),
  submitEnquiry: (b) => request<{whatsappLink?:string,emailSent:boolean}>(`/enquiries`, { method:'POST', body:b }),
  listEnquiries: (t) => request<Enquiry[]>(`/enquiries`, { token:t }),
  markEnquiry: (id,t) => request<Enquiry>(`/enquiries/${id}`, { method:'PATCH', body:{status:'followed_up'}, token:t }),
  uploadImage: (file,t) => upload(`/uploads`, file, t),
};
```

---

## 7. Public pages — build notes

- **Home (`/`):** sections mirroring `08-public-site-spec.md` §3.1. Services & archetypes
  are static brand content from `02`; Featured Properties + Latest Insights come from
  React Query (`useProperties({featured:true})`, `useBlogs({limit:3})`); contact number from
  `useSettings()`.
- **Properties (`/properties`):** filter chips by `assetClass`; off-market toggle. Data via
  `useProperties()`.
- **PropertyDetail (`/properties/:slug`):** gallery, facts grid (bedrooms/bathrooms/size),
  features list, "Private Enquiry" → `/contact?property=<slug>` (reads query to prefill msg).
- **Insights / ArticleDetail:** list + full body. Body rendered from the stored
  markdown/HTML; use `documentation` styling (Georgia, decent measure/blockquote).
- **Contact (`/contact`):** `<EnquiryForm/>` →
  `submitEnquiry({name,email,archetype,message})`. On success show confirmation, the
  returned `whatsappLink` as a "Continue on WhatsApp" button, and the settings
  `contactPhoneLabel`. Show live WhatsApp/email links from `useSettings()`.

---

## 8. Admin pages — build notes

All under `<ProtectedRoute>` (see §5). Visual: emerald base, functional tables/forms,
brass primary buttons, brass confirmation dialogs, toast feedback.

- **Dashboard:** 3 `StatTile`s from `adminBlogs`, `adminProperties`, `listEnquiries`.
- **BlogsAdmin / BlogEditor:** table + create/edit form. Slug auto from title (editable).
  Cover upload via `ImageUploader` (→ `uploadImage` → preview). Body editor: lightweight
  markdown or simple rich-text. `published` toggle.
- **PropertiesAdmin / PropertyEditor:** table + form with all fields from
  `05-database-schema.md` §5; multi-image gallery upload; `featured`/`offMarket`/`published`
  toggles.
- **EnquiriesAdmin:** list with New/Followed-up filter; "Mark followed up"; copy `wa.me`
  link.
- **SettingsAdmin (the contact-number requirement):** form fields `contactPhoneLabel`
  (display), `contactPhone` (for links), `adminEmail`, toggles `emailsEnabled`
  `whatsappEnabled`. Show a live preview of the `wa.me` link. Save → `updateSettings`.
  Banner linking to `02-brand-guide.md` tone rules.

---

## 9. Environment variables (`frontend/.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:4000
```

---

## 10. Build & deploy

```bash
cd frontend && npm install
npm run dev          # dev server :5173
npm run build        # → dist/ (static, upload to Firebase Hosting / Netlify)
```

Public reads hit Firestore directly (Client SDK) for speed; writes/enquiries go through
the API. Set Firestore rules per `05-database-schema.md` §7 so the SPA only **reads**.

---

## 11. Visual acceptance checklist (vs `02 — Brand Guide`)

- [ ] Palette hexes used only via Tailwind tokens; no ad-hoc colors.
- [ ] Display headings in Garamond font family; body in Georgia; labels in Inter.
- [ ] CTAs are brass-filled with emerald text; hover to parchment.
- [ ] Copy avoids all "do not use" phrases from `02` §6.
- [ ] Property/blog images follow art-direction rules (no cliché real-estate tropes).