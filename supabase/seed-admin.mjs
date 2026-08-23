/**
 * Create the Sterling Gates admin (Supabase Auth user + app_users row) and seed
 * the global settings row.
 *
 * Usage (from the repo root, with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set):
 *   SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… \
 *   node supabase/seed-admin.mjs \
 *     --email admin@sterlinggates.ng --password 'LongPassw0rd!' --phone 2348012345678
 *
 * Idempotent: creates the auth user only if missing, upserts app_users by id,
 * and never overwrites settings that already exist.
 */
import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const get = (k) => {
  const i = args.indexOf(`--${k}`);
  return i > -1 ? args[i + 1] : undefined;
};

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('✗ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (service role).');
  process.exit(1);
}
const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = get('email') ?? 'admin@sterlinggates.ng';
const password = get('password') ?? 'Admin123!';
const phone = get('phone') ?? '2348012345678';
const name = get('name') ?? 'Ada Eze';

async function main() {
  // 1. Supabase Auth user (confirmed immediately — this is an admin).
  let uid;
  const { data: existing } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const found =
    existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (found) {
    uid = found.id;
    console.log(`✓ Auth user exists: ${email} (${uid})`);
  } else {
    const created = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (created.error) throw created.error;
    uid = created.data.user.id;
    console.log(`✓ Created Supabase Auth user: ${email} (${uid})`);
  }

  //  Insert/update the app_users row keyed by the Supabase auth id.
  const { error: usersError } = await sb
    .from('app_users')
    .upsert(
      { id: uid, email, name, role: 'admin', active: true },
      { onConflict: 'id' },
    );
  if (usersError) throw usersError;
  console.log('✓ Upserted app_users/', uid, 'role=admin active=true');

  //  Seed settings only if the single row doesn't exist yet.
  const { data: settingsRow } = await sb
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  if (!settingsRow) {
    const { error: settingsError } = await sb.from('settings').insert({
      id: 1,
      contact_phone: phone,
      contact_phone_label: 'WhatsApp / Call',
      admin_email: email,
      emails_enabled: true,
      whatsapp_enabled: true,
    });
    if (settingsError) throw settingsError;
    console.log(`✓ Wrote settings row (contact ${phone})`);
  } else {
    console.log('↷ settings already exist — left untouched.');
  }

  console.log('Done.');
}