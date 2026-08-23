# 10 — Setup Guide (Local Dev & Deployment)

How to stand up the Sterling Gates platform: Firebase project, NestJS backend, React+Vite
frontend, admin bootstrap, and deployment. Intended for the developer who builds this from
the specs.

---

## 0. Prerequisites

- Node.js **18+** (LTS) and npm/yarn/pnpm.
- A **Firebase** account/project (Blaze plan for Storage + Cloud Run if used; Firestore
  Native mode).
- A **Nodemailer**-compatible SMTP account (e.g. Gmail app password, Resend/SMTP2GO).
- The brand assets from `02 — Brand Guide` (palette already in Tailwind config spec).

---

## 1. Repo layout (recommended monorepo)

```
dan/
├── frontend/          # Vite + React + Tailwind (public + admin)
├── backend/           # NestJS API
├── firebase/          # firestore.rules, seed scripts, service-account
└── docs/              # this documentation set
```

---

## 2. Firebase project setup

1. **Create project** in the Firebase console and enable:
   - **Authentication** → sign-in method: Email/Password (and optionally Google).
   - **Firestore Database** → production mode.
   - **Storage** → for image uploads.
2. **Download** the service-account JSON → `backend/firebase-service-account.json`
   (never commit).
3. **Copy web app config** (apiKey, authDomain, projectId, storageBucket, appId,
   messagingSenderId) → those are the **frontend** env values.
4. Apply `firebase/firestore.rules` from `05 — Database Schema` §7,
   and security rules for Storage (allow read of uploaded images; uploads only via the
   authenticated admin path).

---

## 3. Backend (NestJS) — local

```bash
cd backend
npm install
```

**Environment** (`backend/.env`):
```
PORT=4000
FIREBASE_PROJECT_ID=...
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
BLOG_SECRET=...            # (optional) for admin JWT signing
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=Sterling Gates <enquiries@sterlinggates.ng>
CORS_ORIGIN=http://localhost:5173
```

**Run:**
```bash
npm run start:dev     # http://localhost:4000
```

Implement modules per `06 — API Specification`, with DTOs and guards per
`04 — System Architecture` §5. Use the **Firebase Admin SDK** for all Firestore writes and
for `verifyIdToken`.

---

## 4. Frontend (React + Vite) — local

```bash
cd frontend
npm install
```

**Environment** (`frontend/.env`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:4000
```

**Tailwind config** — add brand tokens exactly:
```js
colors: {
  emerald:  { DEFAULT: '#111B18', light: '#1a2b24' },
  gold:     '#8C764D',
  brass:    '#E6CB85',
  parchment:'#F0EDE6',
  charcoal: '#1A1A1A',
}
```

**Run:**
```bash
npm run dev        # http://localhost:5173
```

Build pages per `08 — Public Site Spec`; admin per `07 — Admin Panel Spec`.

---

## 5. Bootstrap the first admin

The **first admin** cannot promote themselves (pre-launch setup). Provide a one-off script
`firebase/seed-admin.mjs`:

1. Create a Firebase Auth user (email/password) for the admin.
2. Write `users/<uid>` with `{ role: "admin", email, active: true }`.
3. Write `settings/global` with the initial:
   `{ contactPhone, contactPhoneLabel, adminEmail, emailsEnabled:true, whatsappEnabled:true }`.

Run:
```bash
node firebase/seed-admin.mjs --email admin@sterlinggates.ng --phone 2348012345678
```

> The authoritative admin check is Firestore `users/<uid>.role` — so if custom claims lag,
> access still resolves correctly (see `03 — Tech Stack` risk note).

---

## 6. Seed sample content (optional, recommended)

`firebase/seed-content.mjs` writes 2–3 on-brand **properties** (Ikoyi, Eko Atlantic) and 1–2
**blogs** (Sterling Intelligence Brief), refs `02 — Brand Guide` copy, `published:true`.
Keeps the site non-empty on first deploy.

---

## 7. Enquiry → WhatsApp + email

- Ensure `settings/global` has a valid `contactPhone` and `adminEmail` (bootstrap step).
- Backend uses Nodemailer SMTP env vars (`09 — Enquiry Workflow`).
- The public site reads settings for the number and WhatsApp CTA.

---

## 8. Deployment

### 8.1 Backend (NestJS)
Containerise (`Dockerfile` → node-alpine). Deploy to **Cloud Run** (recommended), **Render**,
or **Railway**. Set all backend env vars in the platform. Attach the Firebase service
account as an env/secret.

### 8.2 Frontend (Vite)
```bash
cd frontend && npm run build        # outputs dist/
```
Deploy `dist/` to **Firebase Hosting**:
```bash
firebase deploy --only hosting
```
or Netlify/Vercel (point build command + `dist` output, inject frontend env).

### 8.3 Rules
Deploy Firestore & Storage rules with the app:
```bash
firebase deploy --only firestore:rules,storage
```

---

## 9. Post-deploy smoke test (verification)

1. Public `/` loads with brand styling; contact number renders from settings.
2. **Admin:** sign in → create + publish a **blog**; it appears on `/insights`.
3. **Admin:** create + publish a **property**; it appears on `/properties` (and Home
   "Featured" if marked featured).
4. **Admin:** change the **contact number** in Settings; the Home contact and the
   successful-enquiry `wa.me` link now use the new number.
5. **Enquiry:** submit the public form → confirm the email arrives and the `wa.me` link /
   WhatsApp CTA points to the current number.
6. Unpublished blogs/properties are **not** visible publicly (rules + API filters work).
7. A non-admin / unauthenticated user gets `401/403` on admin API routes.

---

## 10. Env var checklist

| Env | Where | Purpose |
|-----|-------|---------|
| `FIREBASE_PROJECT_ID` | backend | Firebase app init |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | backend | Admin SDK creds |
| `SMTP_*` / `SMTP_FROM` | backend | Enquiry email |
| `CORS_ORIGIN` | backend | Allow frontend origin |
| `VITE_FIREBASE_*` | frontend | Client auth/host/storage |
| `VITE_API_URL` | frontend | Backend base URL |
| (Firestore) `settings/global` | data | Contact number, admin email, toggles |