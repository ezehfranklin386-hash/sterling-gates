/**
 * Sterling Gates — one-command Supabase setup.
 *
 * Reads backend/.env for SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, then runs the
 * whole provisioning in order (all idempotent — safe to re-run):
 *
 *   1. Applies supabase/schema.sql — via the Management API, which needs a
 *      personal access token (read from $SUPABASE_ACCESS_TOKEN or
 *      ~/.supabase/access-token, created by `npx supabase login`). If no token
 *      exists the script stops and prints short paste-ready instructions for
 *      running schema.sql in the Dashboard SQL editor instead.
 *   2. Creates the public `images` storage bucket (service role).
 *   3. Seeds the admin: Supabase Auth user + app_users row + settings row.
 *   4. Seeds demo content (properties / blogs / curations / advisors) — only
 *      tables that are currently empty.
 *   5. Prints a verification summary.
 *
 * Uses the Supabase HTTP APIs directly (backend/.env service role + the
 * api.supabase.com Management API), so it needs Node 18+ only — no npm install.
 *
 * Usage (from the repo root):
 *   node supabase/setup.mjs
 *   node supabase/setup.mjs --env backend/.env --password 'LongPassw0rd!'
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { properties, blogs, curations, advisors } from './seed-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// --------------------------------------------------------------------------
// CLI args
// --------------------------------------------------------------------------
const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(`--${k}`);
  return i > -1 ? args[i + 1] : undefined;
};
const envPath = get('env') ?? path.join(REPO_ROOT, 'backend', '.env');

// --------------------------------------------------------------------------
// Env loading (backend/.env or --env override; real values stay gitignored)
// --------------------------------------------------------------------------
function loadEnv(file) {
  const out = {};
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return out; // caller handles the missing file
  }
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}
const fileEnv = loadEnv(envPath);

const SUPABASE_URL = process.env.SUPABASE_URL ?? fileEnv.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    `✗ Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n` +
      `  in ${envPath} (dashboard → Settings → API → service_role key).`,
  );
  process.exit(1);
}

// Drop trailing slashes and any stray /rest/v1/, /storage/v1/, /auth/v1/ suffix
// (e.g. a URL copied straight from the dashboard) so BASE is the project root.
const BASE = SUPABASE_URL.trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/i, '')
  .replace(/\/storage\/v1$/i, '')
  .replace(/\/auth\/v1$/i, '');
const PROJECT_REF = (() => {
  try {
    return new URL(BASE).hostname.split('.')[0];
  } catch {
    return null;
  }
})();

const AUTH_HEADERS = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
const JSON_HEADERS = { 'Content-Type': 'application/json', ...AUTH_HEADERS };

// --------------------------------------------------------------------------
// Tiny HTTP helpers (Node 18+ fetch)
// --------------------------------------------------------------------------
async function req(url, { method = 'GET', headers = AUTH_HEADERS, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON (204 etc.) */
  }
  if (!res.ok) {
    const msg = json?.message ?? json?.error ?? json?.msg ?? text ?? res.statusText;
    throw new Error(`${res.status} ${msg}`.trim());
  }
  return { status: res.status, body: json };
}

function postgrest(table, query = '') {
  return req(`${BASE}/rest/v1/${table}${query}`, { method: 'GET' });
}

// --------------------------------------------------------------------------
// 1. Schema (Management API) or dashboard fallback
// --------------------------------------------------------------------------
function readPAT() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  try {
    const token = readFileSync(path.join(homedir(), '.supabase', 'access-token'), 'utf8').trim();
    return token || null;
  } catch {
    return null;
  }
}

// Split a multi-statement SQL file into individual statements, respecting
// single-quoted strings (e.g. jsonb defaults `'[]'`) and `--` comments.
function splitStatements(sql) {
  const stmts = [];
  let buf = '';
  let inStr = false;
  for (const line of sql.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('--')) continue;
    for (const ch of line) {
      if (ch === "'") inStr = !inStr;
      buf += ch;
      if (ch === ';' && !inStr) {
        if (buf.trim()) stmts.push(buf.trim());
        buf = '';
      }
    }
    buf += '\n';
  }
  if (buf.trim()) stmts.push(buf.trim());
  return stmts;
}

async function applySchema(pat) {
  console.log(`\n1/5 Schema (Management API)\n${'-'.repeat(32)}`);
  const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const stmts = splitStatements(sql);
  console.log(`  Applying ${stmts.length} statement(s) to project ${PROJECT_REF}…`);
  const base = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  let applied = 0;
  for (const stmt of stmts) {
    const res = await fetch(base, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pat}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `${stmt};` }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(
        `  ✗ Statement failed (${res.status}):\n    ${stmt.slice(0, 140)}\n    → ${text.slice(0, 300)}`,
      );
      process.exit(1);
    }
    applied += 1;
  }
  console.log(`  ✓ Schema applied (${applied} statements).`);
}

// --------------------------------------------------------------------------
// 2. Storage bucket
// --------------------------------------------------------------------------
async function ensureBucket() {
  console.log(`\n2/5 storage bucket\n${'-'.repeat(32)}`);
  const list = await req(`${BASE}/storage/v1/bucket`);
  const exists = (list.body ?? []).some((b) => b.name === 'images');
  if (exists) {
    console.log('  ↷ images bucket already exists.');
    return;
  }
  await req(`${BASE}/storage/v1/bucket`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: { id: 'images', name: 'images', public: true },
  });
  console.log('  ✓ Created public images bucket.');
}

// --------------------------------------------------------------------------
// 3. Admin + settings
// --------------------------------------------------------------------------
async function ensureAdmin({ email, password, phone, name }) {
  console.log(`\n3/5 admin + settings\n${'-'.repeat(32)}`);

  // a) Supabase Auth user (look up by email first so re-runs are idempotent).
  const list = await req(`${BASE}/auth/v1/admin/users?per_page=1000`);
  const users = Array.isArray(list.body) ? list.body : (list.body?.users ?? []);
  let uid = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (uid) {
    console.log(`  ✓ Auth user exists: ${email} (${uid})`);
  } else {
    const created = await req(`${BASE}/auth/v1/admin/users`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: { email, password, email_confirm: true, user_metadata: { name } },
    });
    uid = created.body.id;
    console.log(`  ✓ Created Supabase Auth user: ${email} (${uid})`);
  }

  // b) app_users row (upsert keyed by the auth id).
  const upsertHeaders = { ...JSON_HEADERS, Prefer: 'resolution=merge-duplicates,return=representation' };
  await req(`${BASE}/rest/v1/app_users?on_conflict=id`, {
    method: 'POST',
    headers: upsertHeaders,
    body: { id: uid, email, name, role: 'admin', active: true },
  });
  console.log(`  ✓ Upserted app_users/${uid} role=admin active=true`);

  // c) settings row — insert if absent, backfill contact info if it's empty
  //    (schema.sql creates the row with no contact_phone).
  const { body: settingsRows } = await postgrest('settings', `?select=*&id=eq.1`);
  const existing = (settingsRows ?? [])[0];
  if (!existing) {
    await req(`${BASE}/rest/v1/settings?on_conflict=id`, {
      method: 'POST',
      headers: upsertHeaders,
      body: {
        id: 1,
        contact_phone: phone,
        contact_phone_label: 'WhatsApp / Call',
        admin_email: email,
        emails_enabled: true,
        whatsapp_enabled: true,
      },
    });
    console.log(`  ✓ Wrote settings row (contact ${phone}).`);
  } else if (!existing.contact_phone) {
    await req(`${BASE}/rest/v1/settings?id=eq.1`, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: {
        contact_phone: phone,
        contact_phone_label: 'WhatsApp / Call',
        admin_email: email,
      },
    });
    console.log(`  ✓ Backfilled settings contact → ${phone}.`);
  } else {
    console.log('  ↧ settings already exist — left untouched.');
  }

  return uid;
}

// --------------------------------------------------------------------------
// 4. Content seeds (only empty tables)
// --------------------------------------------------------------------------
async function seedTable(table, rows) {
  const { body } = await postgrest(table, `?select=id&limit=1`);
  if (body && body.length) {
    console.log(`  ↧ ${table} already has data — skipping.`);
    return;
  }
  // PostgREST bulk insert requires every row to share the same keys — pad any
  // missing key (e.g. properties without bedrooms/bathrooms) with null.
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const stamp = new Date().toISOString();
  const normalized = rows.map((r) => {
    const row = {};
    for (const key of keys) row[key] = r[key] ?? null;
    return { ...row, created_at: stamp, updated_at: stamp };
  });
  await req(`${BASE}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...JSON_HEADERS, Prefer: 'return=representation' },
    body: normalized,
  });
  console.log(`  ✓ Seeded ${rows.length} ${table}.`);
}

async function seedContent() {
  console.log(`\n4/5 content seeds\n${'-'.repeat(32)}`);
  await seedTable('properties', properties);
  await seedTable('blogs', blogs);
  await seedTable('curations', curations);
  await seedTable('advisors', advisors);
}

// --------------------------------------------------------------------------
// 5. Verify
// --------------------------------------------------------------------------
async function verify() {
  console.log(`\n5/5 verification\n${'-'.repeat(32)}`);
  for (const t of ['settings', 'properties', 'blogs', 'curations', 'advisors']) {
    const { body } = await postgrest(t, `?select=id&limit=1`);
    console.log(`  ${t.padEnd(11)} ${(body ?? []).length ? '✓ has rows' : '✗ EMPTY'}`);
  }
}

// --------------------------------------------------------------------------
// main
// --------------------------------------------------------------------------
async function main() {
  console.log(`Sterling Gates → Supabase setup\n${'='.repeat(32)}`);
  console.log(`  base URL   ${BASE}`);
  console.log(`  project    ${PROJECT_REF ?? 'unknown'}\n`);

  // 1. Schema — try the Management API first; fall back to manual paste.
  const pat = readPAT();
  if (pat) {
    await applySchema(pat);
  } else {
    try {
      await postgrest('settings', `?select=id&limit=1`);
      console.log('  ↧ Tables already exist — skipping schema apply.');
    } catch {
      console.error(
        `✗ No Management API token found, so I can't create tables remotely.\n` +
          `  1) Open supabase/schema.sql in a text editor.\n` +
          `  2) In the Supabase Dashboard open SQL Editor (New query).\n` +
          `  3) Paste the whole file and click Run.\n` +
          `  4) Re-run this script:  node supabase/setup.mjs\n` +
          `  (Or set SUPABASE_ACCESS_TOKEN to a token from\n` +
          `   https://supabase.com/dashboard/account/tokens and I'll apply it.)`,
      );
      process.exit(1);
    }
  }

  await ensureBucket();

  const email = get('email') ?? 'admin@sterlinggates.ng';
  const password = get('password') ?? 'Admin123!';
  const phone = get('phone') ?? '2348012345678';
  const name = get('name') ?? 'Ada Eze';
  await ensureAdmin({ email, password, phone, name });

  await seedContent();
  await verify();

  console.log('\nDone. Admin login → https://sterling-gates-six.vercel.app/admin/login');
  console.log(`  email: ${email}   password: ${password}`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});