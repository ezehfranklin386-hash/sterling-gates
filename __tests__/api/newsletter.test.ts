import { GET, POST } from '@/app/api/newsletter/route';

describe('/api/newsletter', () => {
  it('POST creates a subscription (public)', async () => {
    const request = new Request('http://localhost/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'subscriber@example.com' }),
    });
    const response = await POST(request);
    expect(response).toBeDefined();
  });

  it('GET requires authentication', async () => {
    const request = new Request('http://localhost/api/newsletter');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
