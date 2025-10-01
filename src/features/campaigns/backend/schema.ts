import { z } from 'zod';

export const CampaignListQuerySchema = z.object({
  status: z.enum(['recruiting', 'in_progress', 'completed', 'canceled']).optional().default('recruiting'),
  category: z.string().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['latest', 'deadline', 'popular']).optional().default('latest'),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

export const CampaignCardSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  thumbnail_url: z.string().url().nullable(),
  business_name: z.string(),
  category: z.string(),
  region: z.string().nullable(),
  total_recruits: z.number(),
  current_applicants: z.number(),
  end_date: z.string(),
  status: z.enum(['recruiting', 'in_progress', 'completed', 'canceled']),
});

export type CampaignCard = z.infer<typeof CampaignCardSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignCardSchema),
  total: z.number(),
  has_more: z.boolean(),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

export const CampaignDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  thumbnail_url: z.string().url().nullable(),
  benefits: z.string(),
  missions: z.string(),
  notes: z.string().nullable(),
  additional_images: z.array(z.string().url()).nullable(),
  store_info: z.object({
    store_name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    hours: z.string().optional(),
  }).nullable(),
  business_name: z.string(),
  business_category: z.string(),
  category: z.string(),
  region: z.string().nullable(),
  total_recruits: z.number(),
  current_applicants: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(['recruiting', 'in_progress', 'completed', 'canceled']),
  view_count: z.number(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export type CampaignDetail = z.infer<typeof CampaignDetailSchema>;

// Campaign creation/update schemas
export const CampaignCreateRequestSchema = z.object({
  title: z.string().min(1).max(100),
  thumbnail_url: z.string().url().nullable().optional(),
  benefits: z.string().min(1),
  missions: z.string().min(1),
  notes: z.string().optional(),
  additional_images: z.array(z.string().url()).optional(),
  store_info: z.object({
    store_name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    hours: z.string().optional(),
  }).optional(),
  category: z.string().min(1),
  region: z.string().optional(),
  total_recruits: z.number().min(1).max(1000),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export type CampaignCreateRequest = z.infer<typeof CampaignCreateRequestSchema>;

export const CampaignUpdateRequestSchema = CampaignCreateRequestSchema.partial();

export type CampaignUpdateRequest = z.infer<typeof CampaignUpdateRequestSchema>;

export const CampaignCreateResponseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string(),
});

export type CampaignCreateResponse = z.infer<typeof CampaignCreateResponseSchema>;

// Advertiser's campaign list
export const AdvertiserCampaignQuerySchema = z.object({
  status: z.enum(['recruiting', 'in_progress', 'completed', 'canceled']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type AdvertiserCampaignQuery = z.infer<typeof AdvertiserCampaignQuerySchema>;

export const AdvertiserCampaignItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  thumbnail_url: z.string().url().nullable(),
  category: z.string(),
  region: z.string().nullable(),
  total_recruits: z.number(),
  current_applicants: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(['recruiting', 'in_progress', 'completed', 'canceled']),
  view_count: z.number(),
  created_at: z.string(),
});

export type AdvertiserCampaignItem = z.infer<typeof AdvertiserCampaignItemSchema>;

export const AdvertiserCampaignListResponseSchema = z.object({
  campaigns: z.array(AdvertiserCampaignItemSchema),
  total: z.number(),
  has_more: z.boolean(),
});

export type AdvertiserCampaignListResponse = z.infer<typeof AdvertiserCampaignListResponseSchema>;
