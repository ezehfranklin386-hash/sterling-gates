import { LoginSchema, CreateBlogSchema, CreatePropertySchema } from '@/lib/validation/schemas';

describe('validation schemas', () => {
  describe('LoginSchema', () => {
    it('validates correct login input', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateBlogSchema', () => {
    it('validates correct blog input', () => {
      const result = CreateBlogSchema.safeParse({
        title: 'Test Blog Post',
        content: 'This is the content of the blog post.',
        excerpt: 'Short excerpt',
        status: 'published',
      });
      expect(result.success).toBe(true);
    });

    it('uses default status when not provided', () => {
      const result = CreateBlogSchema.safeParse({
        title: 'Test Blog Post',
        content: 'Content',
      });
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('draft');
    });
  });

  describe('CreatePropertySchema', () => {
    it('validates correct property input', () => {
      const result = CreatePropertySchema.safeParse({
        title: 'Luxury Apartment',
        price: 500000,
        area: 'downtown',
        asset_class: 'residential',
        status: 'available',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid area', () => {
      const result = CreatePropertySchema.safeParse({
        title: 'Test Property',
        price: 500000,
        area: 'invalid-area',
        asset_class: 'residential',
        status: 'available',
      });
      expect(result.success).toBe(false);
    });
  });
});
