const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const key = fs.readFileSync('../tmp_key.txt', 'utf8').trim();
const url = 'https://feojqmbkkaynqjhhmrtq.supabase.co';

console.log('URL:', url);
console.log('Key length:', key.length);
console.log('Key starts:', key.substring(0, 30));

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  fetch: (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    console.log('FETCH URL:', url);
    return fetch(input, init);
  }
});

(async () => {
  console.log('Attempting sign-in...');
  const { data, error } = await sb.auth.signInWithPassword({
    email: 'admin@sterlinggates.ng',
    password: 'Admin123!'
  });
  if (error) {
    console.log('AUTH ERROR:', error.message, error.status);
  } else {
    console.log('SUCCESS! Token:', data.session?.access_token?.substring(0, 50) + '...');
  }
})();
