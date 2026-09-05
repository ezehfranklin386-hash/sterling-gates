// Typed API client for the Next.js backend
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

// Use relative API paths since Next.js API routes are served from the same origin
const base = '';

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
  getPublicSettings: () => request<PublicSettings>(`/api/settings/public`),
  getSettings: (token: string) => request<AdminSettings>(`/api/settings`, { token }),
  updateSettings: (body: AdminSettings, token: string) =>
    request<AdminSettings>(`/api/settings`, { method: 'PUT', body, token }),

  // ---- Blogs ----
  listBlogs: (params?: { limit?: number; page?: number; tag?: string }) =>
    request<Paginated<Blog>>(`/api/blogs${qs(params)}`),
  getBlog: (slug: string) => request<Blog>(`/api/blogs/${slug}`),
  adminBlogs: (token: string) => request<Blog[]>(`/api/blogs/admin`, { token }),
  createBlog: (body: Partial<Blog>, token: string) =>
    request<Blog>(`/api/blogs`, { method: 'POST', body, token }),
  updateBlog: (id: string, body: Partial<Blog>, token: string) =>
    request<Blog>(`/api/blogs/${id}`, { method: 'PATCH', body, token }),
  deleteBlog: (id: string, token: string) =>
    request<void>(`/api/blogs/${id}`, { method: 'DELETE', token }),

  // ---- Properties ----
  listProperties: (params?: PropertyQuery) =>
    request<Paginated<Property>>(`/api/properties${qs(params)}`),
  getPropertyBySlug: (slug: string) => request<Property>(`/api/properties/${slug}`),
  getProperty: (id: string) => request<Property>(`/api/properties/${id}`),
  adminProperties: (token: string) =>
    request<Property[]>(`/api/properties/admin`, { token }),
  createProperty: (body: Partial<Property>, token: string) =>
    request<Property>(`/api/properties`, { method: 'POST', body, token }),
  updateProperty: (id: string, body: Partial<Property>, token: string) =>
    request<Property>(`/api/properties/${id}`, { method: 'PATCH', body, token }),
  deleteProperty: (id: string, token: string) =>
    request<void>(`/api/properties/${id}`, { method: 'DELETE', token }),

  // ---- Enquiries ----
  submitEnquiry: (body: {
    name: string;
    email: string;
    archetype: string;
    message: string;
    propertySlug?: string;
  }) => request<EnquiryResult>(`/api/enquiries`, { method: 'POST', body }),
  listEnquiries: (token: string, status?: string) =>
    request<Enquiry[]>(`/api/enquiries${qs(status ? { status } : undefined)}`, { token }),
  markEnquiry: (id: string, token: string) =>
    request<Enquiry>(`/api/enquiries/${id}`, {
      method: 'PATCH',
      body: { status: 'followed_up' },
      token,
    }),

  // ---- Newsletter ----
  subscribeNewsletter: (email: string) =>
    request<{ subscribed: boolean }>(`/api/newsletter`, {
      method: 'POST',
      body: { email },
    }),
  listNewsletter: (token: string) =>
    request<NewsletterSubscriber[]>(`/api/newsletter`, { token }),
  removeSubscriber: (id: string, token: string) =>
    request<void>(`/api/newsletter/${id}`, { method: 'DELETE', token }),

  // ---- Curations ----
  listCurations: () => request<Paginated<Curation>>(`/api/curations`),
  getCuration: (slug: string) => request<Curation>(`/api/curations/${slug}`),
  adminCurations: (token: string) => request<Curation[]>(`/api/curations/admin`, { token }),
  createCuration: (body: Partial<Curation>, token: string) =>
    request<Curation>(`/api/curations`, { method: 'POST', body, token }),
  updateCuration: (id: string, body: Partial<Curation>, token: string) =>
    request<Curation>(`/api/curations/${id}`, { method: 'PATCH', body, token }),
  deleteCuration: (id: string, token: string) =>
    request<void>(`/api/curations/${id}`, { method: 'DELETE', token }),

  // ---- Advisors ----
  listAdvisors: () => request<Paginated<Advisor>>(`/api/advisors`),
  adminAdvisors: (token: string) => request<Advisor[]>(`/api/advisors/admin`, { token }),
  createAdvisor: (body: Partial<Advisor>, token: string) =>
    request<Advisor>(`/api/advisors`, { method: 'POST', body, token }),
  updateAdvisor: (id: string, body: Partial<Advisor>, token: string) =>
    request<Advisor>(`/api/advisors/${id}`, { method: 'PATCH', body, token }),
  deleteAdvisor: (id: string, token: string) =>
    request<void>(`/api/advisors/${id}`, { method: 'DELETE', token }),

  // ---- Auth ----
  login: (accessToken: string) =>
    request<AuthSession>(`/api/auth/login`, { method: 'POST', body: { accessToken } }),
  me: (token: string) =>
    request<{ uid: string; email: string; role: 'admin' }>(`/api/auth/me`, { token }),

  // ---- Uploads ----
  uploadImage: (file: File, token: string) => upload(`/api/uploads`, file, token),
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
