// Shared queries for the Home page: featured properties + latest insights.

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

const HOME_PARAMS = { limit: 6 };

export function useLatestForHome() {
  const featured = useQuery({
    queryKey: ['properties', { featured: true }],
    queryFn: () => api.listProperties({ ...HOME_PARAMS, featured: true }),
  });
  const latestPosts = useQuery({
    queryKey: ['blogs', { limit: 6 }],
    queryFn: () => api.listBlogs({ limit: 6 }),
  });
  return { featured, latestPosts };
}