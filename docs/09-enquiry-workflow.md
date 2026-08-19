# 09 — Enquiry Workflow

Members of the public inquire via `/contact`. Every submission is persisted and routed to
the admin through **WhatsApp** and **email**, using the **contact number stored in
settings** (which an admin can change — see `07`).

---

## 1. User journey

1. Visitor lands on `/contact`, reads the promise
   (*"Every engagement begins with listening… senior advisors respond within two hours."*).
2. Visitor fills the form: **Full Name · Email Address · Client Archetype · Nature of
   Enquiry**.
3. On submit, the SPA calls `POST /api/enquiries` with the payload.
4. The visitor sees a confirmation plus a **"Continue on WhatsApp"** button.
5. Behind the scenes the NestJS API persists the enquiry, emails the admin, and builds a
   WhatsApp deep-link ready for the admin (and/or pre-fills the visitor's browser).

## 2. Backend flow (`EnquiriesModule`)

```
POST /api/enquiries  { name, email, archetype, message }
        │
        ▼
[DTO validation]  class-validator (required fields, email format, archetype whitelist)
        │ pass
        ▼
[Persist]  write enquiries/{autoId}  =>  { ...body, status:"new", source:"web", createdAt }
        │
        ▼
[Settings]  read settings/global  →  adminEmail, contactPhone, emailsEnabled, whatsappEnabled
        │
        ├─ if emailsEnabled ─▶ Nodemailer send to adminEmail
        │                       subject: "New Sterling Gates enquiry — {name}"
        │                       body:   name, email, archetype, message, date
        │
        └─ build WhatsApp link:
             https://wa.me/{contactPhone}?text={encodeURIComponent(summary)}
        ▼
Respond 201:
{ id, status:"new",
  whatsappLink: "https://wa.me/2348012345678?text=Hello%20Sterling%20Gates...",
  emailSent: true }
```

## 3. WhatsApp delivery

- The **visitor** is offered a "Continue on WhatsApp" button that opens
  `wa.me/<number>?text=...` so the conversation carries the enquiry across seamlessly.
- The **admin** may also receive a WhatsApp notification — the recommended pattern is a
  WhatsApp Business message, but this release ships the portable `wa.me` deep-link
  approach (no external WhatsApp API key required). If a WhatsApp Business API token is
  added later, `contactPhone` is reused to send the admin a proactive message.
- The deep-link text is a compact on-brand summary, e.g.:

  ```
  Hello Sterling Gates. I'm {name} ({archetype}). {message}
  ```

## 4. Email delivery

- **Transport:** Nodemailer (SMTP). Credentials come from env (`SMTP_HOST`, `SMTP_USER`,
  `SMTP_PASS`, `SMTP_FROM`).
- **Recipient:** `settings.adminEmail`.
- **Content:** name, email, archetype, message, timestamp — clean, plain/HTML hybrid.
- **Failure handling:** if SMTP fails, the enquiry is still persisted and the API returns
  `emailSent: false` (with a logged error) so a lead is never lost silently.

## 5. The contact number is dynamic (admin-controlled)

- The public site renders the current **contact number** from `settings.contactPhoneLabel`.
- The enquiry `wa.me` link is built from `settings.contactPhone` **at the moment of
  submission** — so when an admin updates the number in `/admin/settings`, every future
  enquiry automatically uses the new line. (Requirement: *"admin can change number for
  client to contact them"*.)

## 6. Number formatting requirements

- Store `contactPhone` in **international format without `+`, spaces, or dashes**
  (e.g. `2348012345678` for a +234 Nigerian line). `contactPhoneLabel` holds the
  human-readable display (`+234 801 234 5678`).
- `SettingsService` normalises on update to guarantee valid `wa.me` links.

## 7. Admin review

- All submissions appear in `/admin/enquiries` (`GET /api/enquiries`).
- Admin can mark an enquiry as **Followed up** (`PATCH /api/enquiries/:id`).
- Admin can copy the `wa.me` or mailto link to follow up manually.

## 8. Failure & edge cases

| Case | Behaviour |
|------|-----------|
| Empty / invalid form | 400 validation error; form shows inline errors; nothing persisted |
| SMTP down | Enquiry persisted; `emailSent:false`; error logged; admin still sees it in panel |
| Contact number removed | `whatsappLink` omitted from response; site hides the WhatsApp CTA and shows email only |
| Duplicate rapid submissions | Optional simple rate-limit (per IP / email) before persist |

## 9. Config surface

- Env: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Firestore `settings/global`: `contactPhone`, `contactPhoneLabel`, `adminEmail`,
  `emailsEnabled`, `whatsappEnabled`.
- See `10 — Setup Guide` for where each lives.