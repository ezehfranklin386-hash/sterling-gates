import { getCurrentUser, requireAuth, requireAdmin } from '@/lib/auth/utilities';
import { AuthUser } from '@/lib/auth/types';

describe('auth utilities', () => {
  describe('getCurrentUser', () => {
    it('returns null when not authenticated', async () => {
      const mockRequest = new Request('http://localhost');
      const result = await getCurrentUser(mockRequest);
      expect(result).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('throws 401 when no user is found', async () => {
      const mockRequest = new Request('http://localhost');
      await expect(requireAuth(mockRequest)).rejects.toThrow('Unauthorized');
    });
  });

  describe('requireAdmin', () => {
    it('throws 401 when no user is found', async () => {
      const mockRequest = new Request('http://localhost');
      await expect(requireAdmin(mockRequest)).rejects.toThrow('Unauthorized');
    });
  });
});
