import { GET, POST } from '@/app/api/advisors/route';

describe('/api/advisors', () => {
  it('GET returns advisors list', async () => {
    const request = new Request('http://localhost/api/advisors');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('POST requires authentication', async () => {
    const request = new Request('http://localhost/api/advisors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@test.com' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
