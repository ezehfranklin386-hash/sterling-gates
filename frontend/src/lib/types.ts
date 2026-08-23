// Shared domain types for the Sterling Gates platform.
// Mirrors the Supabase schemas in supabase/schema.sql and the
// backend DTOs in docs/backend-spec.md.

export type AssetClass =
  | 'Residential'
  | 'Commercial'
  | 'Development'
  | 'Land';

export type PropertyStatus = 'available' | 'under-offer' | 'sold';

export interface PropertySize {
  value: number;
  unit: 'sqm' | 'sqft';
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  assetClass: AssetClass;
  area: string;
  location: string;
  price: number;
  size: PropertySize;
  bedrooms?: number;
  bathrooms?: number;
  status: PropertyStatus;
  offMarket: boolean;
  featured: boolean;
  published: boolean;
  assetReference?: string;
  description: string;
  features: string[];
  heroImageUrl: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl?: string;
  author: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

export type Archetype = 'sovereign' | 'family' | 'developer' | 'other';

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  archetype: Archetype;
  message: string;
  status: 'new' | 'followed_up';
  propertySlug?: string;
  source: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
}

export interface CurationFilter {
  assetClass?: AssetClass;
  area?: string;
  offMarket?: boolean;
  status?: PropertyStatus;
  featured?: boolean;
}

export interface Curation {
  id: string;
  slug: string;
  title: string;
  description: string;
  filter: CurationFilter;
  published: boolean;
  createdAt: string;
}

export interface Advisor {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
  focus: string[];
  sortOrder: number;
  published: boolean;
  createdAt: string;
}

export interface PublicSettings {
  adminEmail?: string;
  contactPhone: string;
  contactPhoneLabel: string;
  whatsappLink?: string;
}

export interface AdminSettings extends PublicSettings {
  emailsEnabled?: boolean;
  whatsappEnabled?: boolean;
}

export interface AuthSession {
  accessToken: string;
  user: { uid: string; email: string; role: 'admin' };
}

/** Enquiry submission response (backend §9). */
export interface EnquiryResult {
  id: string;
  status: 'new';
  whatsappLink?: string;
  emailSent: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}