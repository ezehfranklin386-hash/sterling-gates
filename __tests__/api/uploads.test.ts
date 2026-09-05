import { POST } from '@/app/api/uploads/route';

describe('/api/uploads', () => {
  it('POST requires authentication', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.txt');

    const request = new Request('http://localhost/api/uploads', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
