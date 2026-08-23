-- Sterling Gates — Supabase schema (run in the Supabase Studio SQL editor).
-- Column naming is snake_case; the backend maps to the camelCase API contract in-service.
-- All reads/writes go through the backend service role (bypasses RLS); the
-- frontend never queries Postgres directly, so RLS is enabled with NO anon access.

-- ---------------------------------------------------------------
-- app_users : admins backing the app JWT / admin routes
-- ---------------------------------------------------------------
create table if not exists app_users (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  role       text not null default 'admin',
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- settings : single global row with contact / email / whatsapp config
-- ---------------------------------------------------------------
create table if not exists settings (
  id                    integer primary key default 1 check (id = 1),
  contact_phone         text,
  contact_phone_label   text,
  admin_email           text,
  emails_enabled        boolean not null default false,
  whatsapp_enabled      boolean not null default true,
  updated_at            timestamptz not null default now()
);
insert into settings (id) values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------
-- blogs
-- ---------------------------------------------------------------
create table if not exists blogs (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  body             text,
  cover_image_url  text,
  author           text,
  tags             jsonb not null default '[]',
  published        boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------
create table if not exists properties (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  location          text,
  area              text,
  asset_reference   text,
  asset_class       text,
  price             numeric,
  status            text not null default 'available',
  bedrooms          integer,
  bathrooms         integer,
  size              jsonb not null default '{}',
  description       text,
  features          jsonb not null default '[]',
  hero_image_url    text,
  image_urls        jsonb not null default '[]',
  featured          boolean not null default false,
  off_market        boolean not null default false,
  published         boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- curations
-- ---------------------------------------------------------------
create table if not exists curations (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text,
  filter      jsonb not null default '{}',
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- advisors
-- ---------------------------------------------------------------
create table if not exists advisors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,
  bio         text,
  photo_url   text,
  focus       jsonb not null default '[]',
  sort_order  integer not null default 0,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------
create table if not exists enquiries (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  archetype     text,
  message       text,
  property_slug text,
  status        text not null default 'new',
  source        text not null default 'web',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- subscribers
-- ---------------------------------------------------------------
create table if not exists subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  status      text not null default 'active',
  source      text,
  created_at  timestamptz not null default now()
);

-- Convenience indexes on common filters.
create index if not exists idx_properties_published_featured on properties (published, featured);
create index if not exists idx_properties_area              on properties (area);
create index if not exists idx_blogs_published_at           on blogs (published, published_at desc);
create index if not exists idx_advisors_sort_order          on advisors (sort_order);