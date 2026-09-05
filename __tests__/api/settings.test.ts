import { GET, PUT } from '@/app/api/settings/route';
import { GET as GET_PUBLIC } from '@/app/api/settings/public/route';

describe('/api/settings', () => {
  it('GET requires authentication', async () => {
    const request = new Request('http://localhost/api/settings');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('PUT requires authentication', async () => {
    const request = new Request('http://localhost/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_name: 'Test Site' }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(401);
  });
});

describe('/api/settings/public', () => {
  it('GET returns public settings', async () => {
    const request = new Request('http://localhost/api/settings/public');
    const response = await GET_PUBLIC(request);
    expect(response.status).toBe(200);
  });
});
