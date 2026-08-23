import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Curation } from '../lib/types';

export function useCurations() {
  return useQuery({ queryKey: ['curations'], queryFn: () => api.listCurations() });
}

export function useCuration(slug: string | undefined) {
  return useQuery({
    queryKey: ['curation', slug],
    queryFn: () => api.getCuration(slug!),
    enabled: Boolean(slug),
  });
}

export function useAdminCurations(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-curations'],
    queryFn: () => api.adminCurations(token!),
    enabled: Boolean(token),
  });
}

export function useCreateCuration(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Curation>) => api.createCuration(body, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-curations'] }),
  });
}

export function useUpdateCuration(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Curation> }) =>
      api.updateCuration(id, body, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-curations'] });
      qc.invalidateQueries({ queryKey: ['curations'] });
    },
  });
}

export function useDeleteCuration(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCuration(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-curations'] });
      qc.invalidateQueries({ queryKey: ['curations'] });
    },
  });
}