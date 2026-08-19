# BE — Backend Build Spec (NestJS + Firebase)

> The NestJS REST API is the **only** write path to Firestore and the authority for admin
> role checks. It also handles the enquiry → email + WhatsApp flow.

- Stack: **NestJS 10**, **@nestjs/config**, **firebase-admin**, **@nestjs/jwt**,
  **nodemailer**, **class-validator** + **class-transformer**, **@nestjs/serve-static** (optional).
- Base: `backend/` (monorepo sibling to `frontend/`).

---

## 1. Directory structure

```
backend/
├── src/
│   ├── main.ts                 # bootstrap, global ValidationPipe, CORS, /api prefix
│   ├── app.module.ts           # Config, Auth, Blogs, Properties, Settings, Enquiries, Newsletter, Curations, Advisors, Uploads
│   ├── common/
│   │   ├── firebase/
│   │   │   ├── firebase.module.ts
│   │   │   └── firebase.service.ts      # admin.initializeApp / auth / firestore / storage
│   │   ├── guards/
│   │   │   ├── auth.guard.ts            # verifies Firebase ID token / app JWT
│   │   │   └── admin.guard.ts           # role === 'admin' from Firestore users/<uid>
│   │   └── decorators/
│   │       ├── current-user.decorator.ts# injects req.user
│   │       └── public.decorator.ts      # opt-out of AuthGuard
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts          # POST /auth/firebase, GET /auth/me
│   │   ├── auth.service.ts
│   │   └── dto/firebase-login.dto.ts
│   ├── blogs/
│   │   ├── blogs.module.ts
│   │   ├── blogs.controller.ts        # public reads + admin CRUD
│   │   ├── blogs.service.ts
│   │   └── dto/create-blog.dto.ts, update-blog.dto.ts
│   ├── properties/
│   │   ├── properties.module.ts
│   │   ├── properties.controller.ts
│   │   ├── properties.service.ts
│   │   └── dto/create-property.dto.ts, update-property.dto.ts
│   ├── settings/
│   │   ├── settings.module.ts
│   │   ├── settings.controller.ts     # GET public, PUT admin
│   │   ├── settings.service.ts        # number normalization + wa.me builder
│   │   └── dto/update-settings.dto.ts
│   ├── enquiries/
│   │   ├── enquiries.module.ts
│   │   ├── enquiries.controller.ts    # POST public, GET/PATCH admin
│   │   ├── enquiries.service.ts       # persist + email + whatsapp
│   │   └── dto/create-enquiry.dto.ts, update-enquiry.dto.ts
│   ├── newsletter/
│   │   ├── newsletter.module.ts
│   │   ├── newsletter.controller.ts    # POST public, GET/DELETE admin
│   │   ├── newsletter.service.ts       # upsert subscribers, rate-limit
│   │   └── dto/subscribe.dto.ts
│   ├── curations/
│   │   ├── curations.module.ts
│   │   ├── curations.controller.ts     # GET public + admin CRUD
│   │   ├── curations.service.ts
│   │   └── dto/create-curation.dto.ts, update-curation.dto.ts
│   ├── advisors/
│   │   ├── advisors.module.ts
│   │   ├── advisors.controller.ts      # GET public + admin CRUD
│   │   ├── advisors.service.ts
│   │   └── dto/create-advisor.dto.ts, update-advisor.dto.ts
│   └── uploads/
│       ├── uploads.module.ts
│       ├── uploads.controller.ts      # POST multipart → Storage → URL
│       └── uploads.service.ts
├── firebase-service-account.json      # git-ignored
├── .env
├── Dockerfile
└── package.json
```

---

## 2. Bootstrap (`main.ts`)

```ts
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('api');
app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true,
  transform: true }));
await app.listen(process.env.PORT ?? 4000);
```

---

## 3. Firebase service (`common/firebase/firebase.service.ts`)

Initialise once:
```ts
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
```
Expose typed handles: `auth (getAuth)`, `db (getFirestore)`, `storage (getStorage)`.

---

## 4. Guards

**AuthGuard** (`common/guards/auth.guard.ts`)
- Read `Authorization: Bearer <idToken>`.
- `admin.auth().verifyIdToken(idToken)` → `req.user = { uid, email }`.
- `@Public()` decorator bypasses it.

**AdminGuard** (`common/guards/admin.guard.ts`)
- Requires AuthGuard first. Then resolve the **authoritative role**:
  `await db.collection('users').doc(uid).get()` → `role === 'admin'` **and** `active === true`.
- Throw `ForbiddenException` otherwise. Apply to all mutating/private routes.

> Using Firestore role (not only the JWT claim) avoids custom-claim propagation lag — see
> `03-tech-stack.md` §5 risk note.

---

## 5. Auth module

### `POST /api/auth/firebase`
```ts
async login({ idToken }: FirebaseLoginDto) {
  const decoded = await this.auth.verifyIdToken(idToken);      // server-side verify
  const doc = await this.db.collection('users').doc(decoded.uid).get();
  if (!doc.exists || doc.data().role !== 'admin' || !doc.data().active)
    throw new ForbiddenException('Access requires admin role');
  return {
    accessToken: await this.jwt.signAsync({ uid: decoded.uid, role: 'admin' }),
    user: { uid: decoded.uid, email: decoded.email, role: 'admin' },
  };
}
```
### `GET /api/auth/me`
Return the profile for the current admin from the JWT.

---

## 6. Settings module (contact-number requirement)

### `GET /api/settings` — `@Public()`
Returns the public subset used by the site and enquiry flow:
```json
{ "contactPhone": "2348012345678",
  "contactPhoneLabel": "+234 801 234 5678",
  "whatsappLink": "https://wa.me/2348012345678" }
```
Normalise on read: strip `+`, spaces, dashes; build `wa.me` from the digits.

### `PUT /api/settings` — AdminGuard
`UpdateSettingsDto`: `contactPhone` (string), `contactPhoneLabel`, `adminEmail`, `emailsEnabled`, `whatsappEnabled`. Writes `settings/global`. Returns updated doc.

---

## 7. Blogs module

Public endpoints (`@Public()`):
- `GET /blogs?limit&page` → published only, newest first, `{ total, items }` (id, title,
  slug, excerpt, coverImageUrl, author, tags, publishedAt).
- `GET /blogs/:slug` → single published with `body`.

Admin endpoints (AdminGuard):
- `GET /blogs/admin` → all incl. drafts.
- `POST /blogs` `CreateBlogDto` → slug unique check, set timestamps. Auto-set
  `publishedAt` if `published`.
- `PATCH /blogs/:id` `UpdateBlogDto` (partial, whitelisted).
- `DELETE /blogs/:id`.

---

## 8. Properties module

Public:
- `GET /properties?q&assetClass&area&priceMin&priceMax&status&featured&offMarket&limit&page`
  → published only (implements the search/filter bar, `11` §1).
- `GET /properties/:slug` → single published.

Admin:
- `GET /properties/admin`
- `POST /properties` `CreatePropertyDto` (all fields per `05-database-schema.md` §5).
- `PATCH /properties/:id`, `DELETE /properties/:id`.

---

## 9. Enquiries module (enquiry → WhatsApp + email)

### `POST /api/enquiries` — `@Public()`
`CreateEnquiryDto`: `name`, `email`, `archetype` (whitelist: sovereign | family | developer | other), `message`.
```ts
async create(dto) {
  const ref = await db.collection('enquiries').add({
    ...dto, status: 'new', source: 'web', createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  const s = await getSettings();                    // settings/global
  let emailSent = false;
  if (s.emailsEnabled && s.adminEmail) {
    emailSent = await this.mailer.send(s.adminEmail, dto).catch(() => false);   // Nodemailer
  }
  const whatsappLink = (s.whatsappEnabled && s.contactPhone)
    ? `https://wa.me/${s.contactPhone}?text=${encodeURIComponent(
        `Hello Sterling Gates. I'm ${dto.name} (${dto.archetype}). ${dto.message}`)}`
    : undefined;
  return { id: ref.id, status: 'new', whatsappLink, emailSent };
}
```
### `GET /api/enquiries` (AdminGuard) — list, `?status=`
### `PATCH /api/enquiries/:id` (AdminGuard) — set `status='followed_up'`

**Mailer** (`enquiries.service.ts`): Nodemailer transport from env; plain + HTML; subject
`New Sterling Gates enquiry — ${name}`; failure caught → `emailSent:false` (lead never lost).

---

## 10. Uploads module

`POST /api/uploads` (AdminGuard, `multer` memory storage):
- Validate MIME (image/jpeg, png, webp) + size limit (≤ 5 MB).
- `storage.bucket().file(<uuid>-<name>.jpg).save(buffer)` → make public → return download URL.

---

## 10.1 Newsletter module (Intelligence Brief)

### `POST /api/newsletter` — `@Public()` (rate-limited)
`SubscribeDto`: `email` (`@IsEmail()`). Upsert into `subscribers` (by lowercased email).
Respond `{ subscribed: true }`. Throttle per email/IP.
### `GET /api/newsletter` (AdminGuard) — list subscribers
### `DELETE /api/newsletter/:id` (AdminGuard) — remove / set `status='unsubscribed'`

## 10.2 Curations module

Public:
- `GET /curations` → published curations + `filter` (a saved property filter).
Listing renders by calling `GET /properties?<filter>`.
Admin (AdminGuard):
- `GET /curations/admin`; `POST /curations` `CreateCurationDto` (title, slug,
  description, `filter` object, published); `PATCH /curations/:id`; `DELETE /curations/:id`.

## 10.3 Advisors module

Public:
- `GET /advisors` → published, ordered by `sortOrder` (name, role, bio, photoUrl, focus).
Admin (AdminGuard):
- `GET /advisors/admin`; `POST /advisors` `CreateAdvisorDto` (name, role, bio, photoUrl,
  focus[] , sortOrder, published); `PATCH /advisors/:id`; `DELETE /advisors/:id`.

---

## 11. DTOs (validation)

Use `class-validator`:
- `IsString`, `IsEmail`, `IsBoolean`, `IsNumber`, `IsOptional`, `IsIn([...])`,
  `IsArray`, `ArrayMaxSize`, `IsUrl` for images, `MaxLength` on copy fields.
- `create-property.dto.ts` nests `size: { value: number, unit: 'sqm' }` via
  `@ValidateNested({ each: true }) @Type(() => SizeDto)`.
- Whitelist archetype in enquiries and assetClass in properties.

---

## 12. Environment (`backend/.env`)

```
PORT=4000
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
JWT_SECRET=change-me
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Sterling Gates <enquiries@sterlinggates.ng>"
CORS_ORIGIN=http://localhost:5173
```

---

## 13. Security checklist

- [ ] Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` on all bodies.
- [ ] AdminGuard on every mutating/admin route; `@Public()` only where intended.
- [ ] Firestore writes **only** via Admin SDK (bypasses rules — never expose service creds to client).
- [ ] Firestore read rules permit public reads of **published** docs only
      (`05-database-schema.md` §7).
- [ ] Uploads: MIME + size limits; random filenames; no path injection.
- [ ] JWT secret from env; tokens short-lived.
- [ ] Email template escapes user content (no HTML injection into email).

---

## 14. Local run & deploy

```bash
cd backend && npm install
npm run start:dev        # http://localhost:4000
```
Docker: `node:20-alpine`, copy `src` + deps, `CMD ["node","dist/main"]`. Deploy to Cloud Run
/ Render / Railway with env vars + service-account. See `10-setup-guide.md` for firebase
deploy, admin seed (`seed-admin.mjs`), and the post-deploy smoke test.