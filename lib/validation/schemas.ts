import { z } from 'zod';
import { ASSET_CLASSES, AREAS, PROPERTY_STATUSES, ARCHETYPES } from '@/lib/constants/enums';

// ============================================================
// Auth Schemas
// ============================================================
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ============================================================
// Advisor Schemas
// ============================================================
export const CreateAdvisorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const UpdateAdvisorSchema = CreateAdvisorSchema.partial();

// ============================================================
// Blog Schemas
// ============================================================
export const CreateBlogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured_image: z.string().url().optional(),
  author_id: z.string().uuid().optional(),
});

export const UpdateBlogSchema = CreateBlogSchema.partial();

// ============================================================
// Curation Schemas
// ============================================================
export const CreateCurationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  property_ids: z.array(z.string().uuid()),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const UpdateCurationSchema = CreateCurationSchema.partial();

// ============================================================
// Enquiry Schemas
// ============================================================
export const CreateEnquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
  property_id: z.string().uuid().optional(),
});

export const UpdateEnquirySchema = z.object({
  status: z.enum(['new', 'in-progress', 'resolved', 'rejected']).optional(),
  notes: z.string().optional(),
});

// ============================================================
// Newsletter Schemas
// ============================================================
export const CreateNewsletterSchema = z.object({
  email: z.string().email(),
});

// ============================================================
// Property Schemas
// ============================================================
export const CreatePropertySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  area: z.enum(AREAS),
  asset_class: z.enum(ASSET_CLASSES),
  status: z.enum(PROPERTY_STATUSES),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  size: z.number().positive().optional(),
  archetype: z.enum(ARCHETYPES).optional(),
  featured_image: z.string().url().optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

// ============================================================
// Settings Schemas
// ============================================================
export const UpdateSettingsSchema = z.object({
  site_name: z.string().min(1).optional(),
  site_description: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
});

// ============================================================
// Type Exports
// ============================================================
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateAdvisorInput = z.infer<typeof CreateAdvisorSchema>;
export type UpdateAdvisorInput = z.infer<typeof UpdateAdvisorSchema>;
export type CreateBlogInput = z.infer<typeof CreateBlogSchema>;
export type UpdateBlogInput = z.infer<typeof UpdateBlogSchema>;
export type CreateCurationInput = z.infer<typeof CreateCurationSchema>;
export type UpdateCurationInput = z.infer<typeof UpdateCurationSchema>;
export type CreateEnquiryInput = z.infer<typeof CreateEnquirySchema>;
export type UpdateEnquiryInput = z.infer<typeof UpdateEnquirySchema>;
export type CreateNewsletterInput = z.infer<typeof CreateNewsletterSchema>;
export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
