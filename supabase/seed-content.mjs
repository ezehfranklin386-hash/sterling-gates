/**
 * Seed demo content: 4 properties (one per asset class), 2 blogs, 1 curated
 * collection, 2 advisors. Idempotent — skips a table if it already has rows,
 * so re-running never duplicates.
 *
 * Uses the same licensed Unsplash photography the frontend ships with
 * (frontend/src/lib/images.ts). No copyrighted Pinterest pins.
 *
 * Usage (from the repo root):
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node supabase/seed-content.mjs
 */
// Lazy so this file can be *imported* by setup.mjs (which drives everything via
// the Supabase HTTP APIs without needing the npm package at the repo root).
// When used as a standalone script it resolves @supabase/supabase-js from the
// backend's node_modules (cd backend && node ../supabase/seed-content.mjs).
let sb = null;
async function createSb() {
  if (sb) return sb;
  let createClient;
  try {
    ({ createClient } = await import('@supabase/supabase-js'));
  } catch {
    // Fallback: resolve the package from backend/node_modules (the script lives
    // in supabase/, which has no node_modules of its own).
    const { createRequire } = await import('node:module');
    const require = createRequire(new URL('../backend/package.json', import.meta.url));
    createClient = require('@supabase/supabase-js').createClient;
  }
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('✗ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role).');
    process.exit(1);
  }
  sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return sb;
}

const u = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const stamp = new Date().toISOString();

const properties = [
  {
    slug: 'waterfront-villa-eko-atlantic',
    title: 'Waterfront Residence, Eko Atlantic',
    asset_class: 'Residential',
    area: 'Eko Atlantic',
    location: 'Marina One, Eko Atlantic City',
    price: 1200000,
    size: { value: 640, unit: 'sqm' },
    bedrooms: 5,
    bathrooms: 6,
    status: 'available',
    off_market: false,
    featured: true,
    published: true,
    asset_reference: 'SG-R-1001',
    description:
      'A five-bedroom waterfront residence with uninterrupted lagoon views, private infinity pool and smart-home systems throughout.',
    features: ['Infinity pool', 'Private lift', 'Smart home', 'Staff quarters', 'Dock access'],
    hero_image_url: u('photo-1600596542815-ffad4c1539a9'),
    image_urls: [
      u('photo-1600596542815-ffad4c1539a9'),
      u('photo-1600607687939-ce8a6c25118c'),
      u('photo-1600210492486-724fe5c67fb0'),
    ],
  },
  {
    slug: 'tower-office-ikoyi',
    title: 'Grade-A Office Tower, Ikoyi',
    asset_class: 'Commercial',
    area: 'Ikoyi',
    location: 'Bourdillon Road, Ikoyi',
    price: 4800000,
    size: { value: 3200, unit: 'sqm' },
    status: 'under-offer',
    off_market: false,
    featured: true,
    published: true,
    asset_reference: 'SG-2001',
    description:
      'Full-floor Grade-A office space in a landmark Ikoyi tower, with 24/7 security, generator and covered parking.',
    features: ['24/7 power', 'Covered parking', 'High-speed elevators', 'Conference suites'],
    hero_image_url: u('photo-1486406146926-c627a92ad1ab'),
    image_urls: [
      u('photo-1486406146926-c627a92ad1ab'),
      u('photo-1480714378408-67cf0d13bc1b'),
      u('photo-1497366754035-f200968a6e72'),
    ],
  },
  {
    slug: 'waterfront-plot-lekki-phase-1',
    title: 'Waterfront Plot, Lekki Phase 1',
    asset_class: 'Land',
    area: 'Lekki Phase 1',
    location: 'Akin Adesola Street',
    price: 850000,
    size: { value: 1200, unit: 'sqm' },
    status: 'available',
    off_market: false,
    featured: true,
    published: true,
    asset_reference: 'SG-L-041',
    description:
      'A rare 1,200sqm waterfront plot with clean title and gated-community option in the heart of Lekki Phase 1.',
    features: ['Clean title', 'Fenced', 'Waterfront', 'Gated community option'],
    hero_image_url: u('photo-1512453979798-5ea266f8880c'),
    image_urls: [u('photo-1512453979798-5ea266f8880c')],
  },
  {
    slug: 'mixed-use-development-victoria-island',
    title: 'Mixed-Use Development Lot, Victoria Island',
    asset_class: 'Development',
    area: 'Victoria Island',
    location: 'Adeola Odeku, Victoria Island',
    price: 12500000,
    size: { value: 1800, unit: 'sqm' },
    status: 'available',
    off_market: true,
    featured: false,
    published: true,
    asset_reference: 'DEV-700',
    description:
      'A prime 1,800sqm development lot zoned for mixed-use residential and retail, ideal for a boutique tower.',
    features: ['Core zoning', 'Utilities on site', 'Development-ready', 'Corner plot'],
    hero_image_url: u('photo-1494526585095-c41746248156'),
    image_urls: [u('photo-1494526585095-c41746248156'), u('photo-1477959858617-67f85cf4f1df')],
  },
];

const blogs = [
  {
    slug: 'why-eko-atlantic-is-lagos-next-prime-frontier',
    title: 'Why Eko Atlantic Is Lagos’ Next Prime Frontier',
    excerpt:
      'From land reclamation to skyline-defining towers, a closer look at the district reshaping Lagos luxury living.',
    body:
      'Eko Atlantic is being built on land reclaimed from the ocean and is already home to some of the ' +
      "continent's most ambitious residential towers. For buyers weighing capital growth against lifestyle, " +
      'the combination of waterfront living, urban planning, and diplomatic security is unmatched on the ' +
      'continent. Sterling Gates advises a selective approach: buy early in the curve, prefer marina ' +
      'frontage, and structure purchases with clean, verifiable titles.',
    cover_image_url: u('photo-1600596542815-ffad4c1539a9', 900),
    author: 'Ada Eze',
    tags: ['Insight', 'Eko Atlantic', 'Lagos'],
    published: true,
  },
  {
    slug: 'the-waterfront-portfolio-2026',
    title: 'The Waterfront Portfolio: Our Best New Entries of 2026',
    excerpt:
      'Five residences and plots we are most excited to present this year, from Eko Atlantic to Lekki.',
    body:
      'Strong demand dynamics continue to favour waterfront assets across Ikoyi, Eko Atlantic and ' +
      'Lekki Phase 1. This shortlist reflects our conviction: homes and plots with scarcity, title ' +
      'certainty, and a view worth protecting. Reach out for the full pack — and our long view on ' +
      'lagoon-frontage within a five-year horizon.',
    cover_image_url: u('photo-1600607687939-ce8a6c25118c', 900),
    author: 'Franklin Eze',
    tags: ['Portfolio', 'Waterfront'],
    published: true,
  },
];

const curations = [
  {
    slug: 'featured-residences',
    title: 'Featured Residences',
    description: 'A hand-picked selection of our most distinguished homes across the Lagos waterfront.',
    filter: { featured: true },
    published: true,
  },
];

const advisors = [
  {
    name: 'Ada Eze',
    role: 'Advisory Director',
    bio: 'Over 15 years guiding sovereign and family offices through Lagos’s prime-residential market.',
    photo_url: u('photo-1560250097-0b93528c311a', 600),
    focus: ['Prime Residential', 'Waterfront'],
    sort_order: 1,
    published: true,
  },
  {
    name: 'Franklin Eze',
    role: 'Head of Commercial & Development',
    bio: 'Specialises in landmark commercial assets and ground-up development returns across Ikoyi and the Island.',
    photo_url: u('photo-1573496359142-b8d87734a5a2', 600),
    focus: ['Commercial', 'Development'],
    sort_order: 2,
    published: true,
  },
];

async function seedTable(table, rows) {
  const client = await createSb();
  const { data, error } = await client.from(table).select('id').limit(1);
  if (error) throw error;
  if (data && data.length) {
    console.log(`↷ ${table} already has data — skipping.`);
    return;
  }
  // PostgREST bulk insert requires every row to share the same keys — pad any
  // missing key (e.g. properties without bedrooms/bathrooms) with null.
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const normalized = rows.map((r) => {
    const row = {};
    for (const key of keys) row[key] = r[key] ?? null;
    return { ...row, created_at: stamp, updated_at: stamp };
  });
  const { error: insertError } = await client.from(table).insert(normalized);
  if (insertError) throw insertError;
  console.log(`✓ Seeded ${rows.length} ${table}.`);
}

async function main() {
  await seedTable('properties', properties);
  await seedTable('blogs', blogs);
  await seedTable('curations', curations);
  await seedTable('advisors', advisors);
  console.log('Done.');
}

export { properties, blogs, curations, advisors, seedTable, main };

// Run as a CLI only when invoked directly (setup.mjs imports us without seeding).
import { pathToFileURL } from 'node:url';
const isEntry = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntry) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}