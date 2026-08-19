import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Enquiry, EnquiryResult } from '../lib/types';

export function useEnquiries(token: string | undefined, status?: string) {
  return useQuery({
    queryKey: ['admin-enquiries', status],
    queryFn: () => api.listEnquiries(token!, status),
    enabled: Boolean(token),
  });
}

export function useMarkEnquiry(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markEnquiry(id, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-enquiries'] }),
  });
}

/** Public contact-form submission (docs/backend-spec.md §9). */
export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: (body: {
      name: string;
      email: string;
      archetype: string;
      message: string;
      propertySlug?: string;
    }) => api.submitEnquiry(body),
  });
}

export type { Enquiry, EnquiryResult };