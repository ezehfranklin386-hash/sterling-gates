import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type PropertyQuery } from '../lib/api';
import type { Property } from '../lib/types';

export function useProperties(params?: PropertyQuery) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => api.listProperties(params),
  });
}

export function useProperty(slug: string | undefined) {
  return useQuery({
    queryKey: ['property', slug],
    queryFn: () => api.getProperty(slug!),
    enabled: Boolean(slug),
  });
}

export function useAdminProperties(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => api.adminProperties(token!),
    enabled: Boolean(token),
  });
}

export function useCreateProperty(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Property>) => api.createProperty(body, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-properties'] }),
  });
}

export function useUpdateProperty(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Property> }) =>
      api.updateProperty(id, body, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeleteProperty(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProperty(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}