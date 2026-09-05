// Typed API client for the NestJS backend (docs/backend-spec.md).
// Every read, write, enquiry, subscription and admin call goes through this
// HTTP client.

import type {
  AdminSettings,
  Advisor,
  AuthSession,
  Blog,
  Curation,
  Enquiry,
  EnquiryResult,
  NewsletterSubscriber,
  Paginated,
  Property,
  PublicSettings,
} from './types';

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(typeof body === 'string' ? body : `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

const base = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = opts;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => null));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function qs(params?: object): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export interface PropertyQuery {
  q?: string;
  assetClass?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  status?: string;
  offMarket?: boolean;
  featured?: boolean;
  limit?: number;
  page?: number;
}

export const api = {
  // ---- Settings ----
  getSettings: () => request<PublicSettings>(`/settings`),
  updateSettings: (body: AdminSettings, token: string) =>
    request<AdminSettings>(`/settings`, { method: 'PUT', body, token }),

  // ---- Blogs ----
  listBlogs: (params?: { limit?: number; page?: number; tag?: string }) =>
    request<Paginated<Blog>>(`/blogs${qs(params)}`),
  getBlog: (slug: string) => request<Blog>(`/blogs/${slug}`),
  adminBlogs: (token: string) => request<Blog[]>(`/blogs/admin`, { token }),
  createBlog: (body: Partial<Blog>, token: string) =>
    request<Blog>(`/blogs`, { method: 'POST', body, token }),
  updateBlog: (id: string, body: Partial<Blog>, token: string) =>
    request<Blog>(`/blogs/${id}`, { method: 'PATCH', body, token }),
  deleteBlog: (id: string, token: string) =>
    request<void>(`/blogs/${id}`, { method: 'DELETE', token }),

  // ---- Properties ----
  listProperties: (params?: PropertyQuery) =>
    request<Paginated<Property>>(`/properties${qs(params)}`),
  getProperty: (slug: string) => request<Property>(`/properties/${slug}`),
  adminProperties: (token: string) =>
    request<Property[]>(`/properties/admin`, { token }),
  createProperty: (body: Partial<Property>, token: string) =>
    request<Property>(`/properties`, { method: 'POST', body, token }),
  updateProperty: (id: string, body: Partial<Property>, token: string) =>
    request<Property>(`/properties/${id}`, { method: 'PATCH', body, token }),
  deleteProperty: (id: string, token: string) =>
    request<void>(`/properties/${id}`, { method: 'DELETE', token }),

  // ---- Enquiries ----
  submitEnquiry: (body: {
    name: string;
    email: string;
    archetype: string;
    message: string;
    propertySlug?: string;
  }) => request<EnquiryResult>(`/enquiries`, { method: 'POST', body }),
  listEnquiries: (token: string, status?: string) =>
    request<Enquiry[]>(`/enquiries${qs(status ? { status } : undefined)}`, { token }),
  markEnquiry: (id: string, token: string) =>
    request<Enquiry>(`/enquiries/${id}`, {
      method: 'PATCH',
      body: { status: 'followed_up' },
      token,
    }),

  // ---- Newsletter ----
  subscribeNewsletter: (email: string) =>
    request<{ subscribed: boolean }>(`/newsletter`, {
      method: 'POST',
      body: { email },
    }),
  listNewsletter: (token: string) =>
    request<NewsletterSubscriber[]>(`/newsletter`, { token }),
  removeSubscriber: (id: string, token: string) =>
    request<void>(`/newsletter/${id}`, { method: 'DELETE', token }),

  // ---- Curations ----
  listCurations: () => request<Paginated<Curation>>(`/curations`),
  getCuration: (slug: string) => request<Curation>(`/curations/${slug}`),
  adminCurations: (token: string) => request<Curation[]>(`/curations/admin`, { token }),
  createCuration: (body: Partial<Curation>, token: string) =>
    request<Curation>(`/curations`, { method: 'POST', body, token }),
  updateCuration: (id: string, body: Partial<Curation>, token: string) =>
    request<Curation>(`/curations/${id}`, { method: 'PATCH', body, token }),
  deleteCuration: (id: string, token: string) =>
    request<void>(`/curations/${id}`, { method: 'DELETE', token }),

  // ---- Advisors ----
  listAdvisors: () => request<Paginated<Advisor>>(`/advisors`),
  adminAdvisors: (token: string) => request<Advisor[]>(`/advisors/admin`, { token }),
  createAdvisor: (body: Partial<Advisor>, token: string) =>
    request<Advisor>(`/advisors`, { method: 'POST', body, token }),
  updateAdvisor: (id: string, body: Partial<Advisor>, token: string) =>
    request<Advisor>(`/advisors/${id}`, { method: 'PATCH', body, token }),
  deleteAdvisor: (id: string, token: string) =>
    request<void>(`/advisors/${id}`, { method: 'DELETE', token }),

  // ---- Auth ----
  login: (accessToken: string) =>
    request<AuthSession>(`/auth/login`, { method: 'POST', body: { accessToken } }),
  me: (token: string) =>
    request<{ uid: string; email: string; role: 'admin' }>(`/auth/me`, { token }),

  // ---- Uploads ----
  uploadImage: (file: File, token: string) => upload(`/uploads`, file, token),
};

/** Multipart upload (images only, ≤5MB) → returns the public URL string. */
async function upload(path: string, file: File, token: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  const data = (await res.json()) as { url: string };
  return data.url;
}

export { base as apiBase };