import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

/** Public subscribe — used by Home hero, Footer, and Intelligence section. */
export function useSubscribe() {
  return useMutation({
    mutationFn: (email: string) => api.subscribeNewsletter(email),
  });
}

export function useNewsletterSubscribers(token: string | undefined) {
  return useQuery({
    queryKey: ['admin-newsletter'],
    queryFn: () => api.listNewsletter(token!),
    enabled: Boolean(token),
  });
}

export function useRemoveSubscriber(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removeSubscriber(id, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-newsletter'] }),
  });
}