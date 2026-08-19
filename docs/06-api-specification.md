# 06 — API Specification (NestJS)

Base URL (local): `http://localhost:4000/api` · Auth: `Authorization: Bearer <Firebase ID token>`

**Convention:**
- Public endpoints need no auth.
- **Admin** endpoints require AdminGuard → `401` missing/invalid token, `403` non-admin.
- All dates returned as ISO 8601 / Firestore timestamps.
- All write bodies validated with class-validator DTOs.

---

## 1. Auth

### `POST /api/auth/firebase`
Verify a Firebase ID token server-side; resolve the user's role; return an app token + profile.

**Body**
```json
{ "idToken": "<firebase-id-token>" }
```
**Response 200**
```json
{ "accessToken": "<jwt>", "user": { "uid": "..", "email": "..", "name": "..", "role": "admin" } }
```
**Errors:** `401` invalid token · `403` user lacks admin role.

### `GET /api/auth/me`
Return the current admin profile from `accessToken`. (Admin)

---

## 2. Settings

### `GET /api/settings`  *(public)*
**Response 200**
```json
{
  "contactPhone": "2348012345678",
  "contactPhoneLabel": "+234 801 234 5678",
  "whatsappLink": "https://wa.me/2348012345678"
}
```

### `PUT /api/settings`  *(admin)*
Update contact phone / admin email / toggles.
**Body**
```json
{
  "contactPhone": "2348098765432",
  "contactPhoneLabel": "+234 809 876 5432",
  "adminEmail": "admin@sterlinggates.ng",
  "emailsEnabled": true,
  "whatsappEnabled": true
}
```
**Response 200:** the updated settings object.

---

## 3. Blogs

### `GET /api/blogs`  *(public)*
List **published** posts, newest first. Optional `?limit=&page=`.
**Response 200**
```json
{ "total": 12, "items": [ { "id": "..", "title": "..", "slug": "..",
  "excerpt": "..", "coverImageUrl": "..", "author": "..", "tags": [".."],
  "publishedAt": ".." } ] }
```

### `GET /api/blogs/:slug`  *(public)*
Single published post, full `body`.

### `GET /api/blogs/admin?status=all`  *(admin)*
All posts incl. drafts (for the admin list).

### `POST /api/blogs`  *(admin)* — Create
**Body**
```json
{ "title": "..", "slug": "..", "excerpt": "..", "body": "..",
  "coverImageUrl": "..", "author": "..", "tags": [".."], "published": true }
```
**Response 201:** created blog `{ id, ... }`.

### `PATCH /api/blogs/:id`  *(admin)* — Update (same body, partial allowed)
### `DELETE /api/blogs/:id`  *(admin)* — Delete

---

## 4. Properties

### `GET /api/properties`  *(public)*
List **published** properties. Filters:
`?q=&assetClass=&area=&priceMin=&priceMax=&status=&offMarket=&featured=&page=&limit=`
(`area` values: Eko Atlantic · Ikoyi · Victoria Island · Lekki Phase 1).
Implements the search/filter bar — see `11-feature-enhancements.md` §1.
**Response 200**
```json
{ "total": 8, "items": [ { "id": "..", "title": "..", "slug": "..", "location": "..",
  "area": "Ikoyi", "assetReference": "SG-08420", "assetClass": "Residential",
  "price": 0, "status": "available",
  "heroImageUrl": "..", "imageUrls": [".."], "featured": false, "offMarket": false } ] }
```
> The shipped contract uses `heroImageUrl` + `imageUrls[]` (not a single `images` array)
> and a lowercase `status` (`available` | `under-offer` | `sold`). Price is a plain
> number in USD — there is no `priceCurrency` field consumed by the frontend
> (see `frontend/src/lib/types.ts`).

### `GET /api/properties/:slug`  *(public)*
Single published property, full detail (features, size, gallery).

### `GET /api/properties/admin`  *(admin)*
All properties incl. unpublished.

### `POST /api/properties`  *(admin)* — Create
**Body**
```json
{ "title": "..", "slug": "..", "location": "..", "assetClass": "Residential",
  "price": 0, "status": "available",
  "bedrooms": 4, "bathrooms": 5, "size": { "value": 900, "unit": "sqm" },
  "description": "..", "features": [".."], "heroImageUrl": "..", "imageUrls": [".."],
  "featured": false, "offMarket": false, "published": true }
```
**Response 201:** created property.

### `PATCH /api/properties/:id`  *(admin)* — Update (partial allowed)
### `DELETE /api/properties/:id`  *(admin)* — Delete

---

## 5. Enquiries

### `POST /api/enquiries`  *(public)* — Submit enquiry
**Body**
```json
{ "name": "..", "email": "..", "archetype": "family",
  "message": "Interested in a private residential briefing in Ikoyi." }
```
**Flow:** validate → write `enquiries/:id` → send admin email (Nodemailer) →
build `wa.me` link from `settings.contactPhone`.

**Response 201**
```json
{ "id": "..", "status": "new",
  "whatsappLink": "https://wa.me/2348012345678?text=Hello%20Sterling%20Gates...",
  "emailSent": true }
```

### `GET /api/enquiries`  *(admin)*
List, newest first. `?status=new` to filter.

### `PATCH /api/enquiries/:id`  *(admin)*
Mark `status = "followed_up"`.

---

## 5.1 Newsletter (Intelligence Brief subscription)

### `POST /api/newsletter`  *(public)*
**Body**
```json
{ "email": "client@example.com" }
```
Validate + upsert into `subscribers`. **Response 201**
```json
{ "subscribed": true }
```
Rate-limited per email/IP.

### `GET /api/newsletter`  *(admin)* — list subscribers
### `DELETE /api/newsletter/:id`  *(admin)* — remove/unsubscribe

---

## 5.2 Curated Collections

### `GET /api/curations`  *(public)*
Published curations + their `filter` objects:
```json
{ "items": [ { "id":"..", "title":"Off-Market Placements", "slug":"off-market",
  "description":"..", "filter":{ "offMarket":true } } ] }
```
Rendering calls `GET /api/properties?<filter>` to fill each collection.

### `GET /api/curations/admin`  *(admin)* — all incl. drafts
### `POST /api/curations` / `PATCH /api/curations/:id` / `DELETE /api/curations/:id`  *(admin)*

---

## 5.3 Advisors (Team)

### `GET /api/advisors`  *(public)*
Published advisors ordered by `sortOrder`:
```json
{ "items": [ { "id":"..", "name":"..", "role":"..", "bio":"..",
  "photoUrl":"..", "focus":[".."] } ] }
```

### `GET /api/advisors/admin`  *(admin)* — all
### `POST /api/advisors` / `PATCH /api/advisors/:id` / `DELETE /api/advisors/:id`  *(admin)*
Photos via existing `POST /api/uploads`.

---

## 6. Uploads *(admin)*

### `POST /api/uploads`  *(admin, multipart)*
Upload an image to Firebase Storage.
**Response 201:** `{ "url": "<storage-download-url>" }`
Size-limit & MIME validation applied. Use returned URL in blog/property bodies.

---

## 7. Error model (consistent across API)

```json
{ "statusCode": 400, "message": "Validation failed", "errors": [ ".." ] }
```
Conventional NestJS HTTP status handling. Admin guard errors: `401` / `403` with a
`message` describing the reason.

---

## 8. Endpoint ↔ feature traceability

| Requirement | Endpoints |
|-------------|-----------|
| Post blogs (admin) | `POST/PATCH/DELETE /api/blogs`, `GET /api/blogs/admin` |
| Post properties (admin) | `POST/PATCH/DELETE /api/properties`, `GET /api/properties/admin` |
| Change contact number | `PUT /api/settings` (admin) · `GET /api/settings` (public) |
| Enquiry → WhatsApp + email | `POST /api/enquiries` |
| Admin auth | `POST /api/auth/firebase`, `GET /api/auth/me` |
| Property search & filters | `GET /api/properties` query params |
| Newsletter (Intelligence Brief) | `POST /api/newsletter`, `GET /api/newsletter` |
| Curated collections | `GET /api/curations` + admin CRUD |
| Advisors (team) | `GET /api/advisors` + admin CRUD |