import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AdminSettings, PublicSettings } from '../lib/types';

export function useSettings() {
  return useQuery<PublicSettings>({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, token }: { body: AdminSettings; token: string }) =>
      api.updateSettings(body, token),
    onSuccess: (data) => {
      qc.setQueryData<PublicSettings>(['settings'], data);
    },
  });
}
