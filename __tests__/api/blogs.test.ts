import { GET, POST } from '@/app/api/blogs/route';
import { GET as GET_ADMIN } from '@/app/api/blogs/admin/route';

describe('/api/blogs', () => {
  it('GET returns public published blogs', async () => {
    const request = new Request('http://localhost/api/blogs');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('POST requires authentication', async () => {
    const request = new Request('http://localhost/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Blog', content: 'Content', status: 'published' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});

describe('/api/blogs/admin', () => {
  it('GET requires authentication', async () => {
    const request = new Request('http://localhost/api/blogs/admin');
    const response = await GET_ADMIN(request);
    expect(response.status).toBe(401);
  });
});
