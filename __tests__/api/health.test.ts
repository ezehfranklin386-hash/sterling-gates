import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('returns healthy status', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
  });
});
