import { z } from 'zod';

export const SNSChannelSchema = z.object({
  type: z.enum(['naver', 'youtube', 'instagram', 'threads']),
  channel_name: z.string(),
  url: z.string().url(),
});

export const ApplicationRequestSchema = z.object({
  selected_sns_channel: SNSChannelSchema,
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.'),
  message: z
    .string()
    .min(10, '지원 메시지는 최소 10자 이상이어야 합니다.')
    .max(500, '지원 메시지는 최대 500자까지 입력 가능합니다.'),
});

export type ApplicationRequest = z.infer<typeof ApplicationRequestSchema>;

export const ApplicationResponseSchema = z.object({
  applicationId: z.string().uuid(),
  campaignId: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const MyApplicationQuerySchema = z.object({
  status: z.enum(['pending', 'selected', 'rejected']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type MyApplicationQuery = z.infer<typeof MyApplicationQuerySchema>;

export const MyApplicationItemSchema = z.object({
  id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  campaign_title: z.string(),
  campaign_thumbnail: z.string().url().nullable(),
  business_name: z.string(),
  category: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  visit_date: z.string(),
  created_at: z.string(),
  message: z.string(),
  selected_sns_channel: SNSChannelSchema,
  campaign_start_date: z.string(),
  campaign_end_date: z.string(),
  campaign_deleted: z.boolean(),
});

export type MyApplicationItem = z.infer<typeof MyApplicationItemSchema>;

export const MyApplicationsResponseSchema = z.object({
  applications: z.array(MyApplicationItemSchema),
  total: z.number(),
  has_more: z.boolean(),
});

export type MyApplicationsResponse = z.infer<typeof MyApplicationsResponseSchema>;

// Campaign applicants (advertiser view)
export const CampaignApplicantQuerySchema = z.object({
  status: z.enum(['pending', 'selected', 'rejected']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type CampaignApplicantQuery = z.infer<typeof CampaignApplicantQuerySchema>;

export const CampaignApplicantItemSchema = z.object({
  id: z.string().uuid(),
  influencer_id: z.string().uuid(),
  influencer_name: z.string(),
  status: z.enum(['pending', 'selected', 'rejected']),
  visit_date: z.string(),
  created_at: z.string(),
  message: z.string(),
  selected_sns_channel: SNSChannelSchema,
});

export type CampaignApplicantItem = z.infer<typeof CampaignApplicantItemSchema>;

export const CampaignApplicantsResponseSchema = z.object({
  applicants: z.array(CampaignApplicantItemSchema),
  total: z.number(),
  has_more: z.boolean(),
});

export type CampaignApplicantsResponse = z.infer<typeof CampaignApplicantsResponseSchema>;

export const UpdateApplicationStatusRequestSchema = z.object({
  status: z.enum(['selected', 'rejected']),
});

export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusRequestSchema>;
