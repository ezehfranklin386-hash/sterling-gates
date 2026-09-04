import { GET, POST } from '@/app/api/curations/route';
import { GET as GET_ADMIN } from '@/app/api/curations/admin/route';

describe('/api/curations', () => {
  it('GET returns public curations', async () => {
    const request = new Request('http://localhost/api/curations');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('POST requires authentication', async () => {
    const request = new Request('http://localhost/api/curations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Curation',
        property_ids: [],
        status: 'published',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});

describe('/api/curations/admin', () => {
  it('GET requires authentication', async () => {
    const request = new Request('http://localhost/api/curations/admin');
    const response = await GET_ADMIN(request);
    expect(response.status).toBe(401);
  });
});
