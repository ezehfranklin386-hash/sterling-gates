import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Advisor } from '../lib/types';

export function useAdvisors() {
  return useQuery({ queryKey: ['advisors'], queryFn: () => api.listAdvisors() });
}

export function useAdminAdvisors(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-advisors'],
    queryFn: () => api.adminAdvisors(token!),
    enabled: Boolean(token),
  });
}

export function useCreateAdvisor(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Advisor>) => api.createAdvisor(body, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-advisors'] }),
  });
}

export function useUpdateAdvisor(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Advisor> }) =>
      api.updateAdvisor(id, body, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-advisors'] });
      qc.invalidateQueries({ queryKey: ['advisors'] });
    },
  });
}

export function useDeleteAdvisor(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteAdvisor(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-advisors'] });
      qc.invalidateQueries({ queryKey: ['advisors'] });
    },
  });
}