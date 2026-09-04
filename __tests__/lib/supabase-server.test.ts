import { createServerSupabaseClient } from '@/lib/supabase/server';

describe('createServerSupabaseClient', () => {
  it('creates a Supabase client with request cookies', () => {
    const mockRequest = new Request('http://localhost');
    const client = createServerSupabaseClient(mockRequest);
    expect(client).toBeDefined();
    expect(client.from).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  it('creates a client without request parameter', () => {
    const client = createServerSupabaseClient();
    expect(client).toBeDefined();
  });
});
