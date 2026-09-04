import { GET, POST } from '@/app/api/properties/route';

describe('/api/properties', () => {
  it('GET returns public properties with search params', async () => {
    const request = new Request('http://localhost/api/properties?area=downtown&min_price=100000');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });

  it('POST requires authentication', async () => {
    const request = new Request('http://localhost/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Property',
        price: 500000,
        area: 'downtown',
        asset_class: 'residential',
        status: 'available',
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
