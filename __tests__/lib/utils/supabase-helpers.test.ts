import { toCamelCase, toSnakeCase } from '@/lib/utils/supabase-helpers';

describe('supabase helpers', () => {
  it('converts snake_case to camelCase', () => {
    expect(toCamelCase({ user_name: 'John', created_at: '2024-01-01' }))
      .toEqual({ userName: 'John', createdAt: '2024-01-01' });
  });

  it('converts camelCase to snake_case', () => {
    expect(toSnakeCase({ userName: 'John', createdAt: '2024-01-01' }))
      .toEqual({ user_name: 'John', created_at: '2024-01-01' });
  });

  it('handles nested objects in camelCase conversion', () => {
    expect(toCamelCase({ user_profile: { first_name: 'John' } }))
      .toEqual({ userProfile: { firstName: 'John' } });
  });

  it('handles arrays in conversion', () => {
    expect(toCamelCase([{ user_name: 'John' }]))
      .toEqual([{ userName: 'John' }]);
  });
});
