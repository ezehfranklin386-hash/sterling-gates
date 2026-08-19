import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Blog } from '../lib/types';

export function useBlogs(params?: { limit?: number; page?: number; tag?: string }) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => api.listBlogs(params),
  });
}

export function useBlog(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => api.getBlog(slug!),
    enabled: Boolean(slug),
  });
}

export function useAdminBlogs(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => api.adminBlogs(token!),
    enabled: Boolean(token),
  });
}

export function useCreateBlog(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Blog>) => api.createBlog(body, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blogs'] }),
  });
}

export function useUpdateBlog(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Blog> }) =>
      api.updateBlog(id, body, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useDeleteBlog(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBlog(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-blogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}