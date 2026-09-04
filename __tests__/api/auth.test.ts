import { POST } from '@/app/api/auth/login/route';
import { GET } from '@/app/api/auth/me/route';

describe('/api/auth/login', () => {
  it('returns 400 for invalid input', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', password: '123' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('/api/auth/me', () => {
  it('returns 401 when not authenticated', async () => {
    const request = new Request('http://localhost');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
