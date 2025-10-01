import type { Hono } from 'hono';
import { respond, type ErrorResult, failure } from '@/backend/http/response';
import { getLogger, getSupabase, getUserId, type AppEnv } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/auth';
import {
  CampaignListQuerySchema,
  CampaignCreateRequestSchema,
  CampaignUpdateRequestSchema,
  AdvertiserCampaignQuerySchema,
} from './schema';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  getAdvertiserCampaigns,
  updateCampaign,
  deleteCampaign,
  closeRecruitment,
} from './service';
import type { CampaignErrorCode } from './error';

export const registerCampaignRoutes = (app: Hono<AppEnv>) => {
  // Get campaigns list
  app.get('/campaigns', async (c) => {
    const queryParams = c.req.query();
    const parsed = CampaignListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      const logger = getLogger(c);
      logger.error('Invalid campaign query params', { error: parsed.error });
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCampaigns(
      supabase,
      parsed.success ? parsed.data : CampaignListQuerySchema.parse({}),
    );

    if (!result.ok) {
      logger.error('Get campaigns failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Get campaign by ID
  app.get('/campaigns/:id', async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCampaignById(supabase, campaignId);

    if (!result.ok) {
      logger.error('Get campaign failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Create campaign (advertiser only)
  app.post('/campaigns', withAuth(), async (c) => {
    console.log('[POST /campaigns] Handler reached, userId:', c.get('userId'));
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c)!;

    const body = await c.req.json();
    const parsed = CampaignCreateRequestSchema.safeParse(body);

    if (!parsed.success) {
      logger.error('Invalid campaign data', { error: parsed.error });
      return respond(
        c,
        failure(400, 'VALIDATION_ERROR', '올바르지 않은 데이터입니다.'),
      );
    }

    const result = await createCampaign(supabase, userId, parsed.data);

    if (!result.ok) {
      logger.error('Create campaign failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Get advertiser's campaigns
  app.get('/my/campaigns', withAuth(), async (c) => {
    const queryParams = c.req.query();
    const parsed = AdvertiserCampaignQuerySchema.safeParse(queryParams);

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c)!;

    const result = await getAdvertiserCampaigns(
      supabase,
      userId,
      parsed.success ? parsed.data : AdvertiserCampaignQuerySchema.parse({}),
    );

    if (!result.ok) {
      logger.error('Get advertiser campaigns failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Update campaign
  app.patch('/campaigns/:id', withAuth(), async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c)!;

    const body = await c.req.json();
    const parsed = CampaignUpdateRequestSchema.safeParse(body);

    if (!parsed.success) {
      logger.error('Invalid campaign update data', { error: parsed.error });
      return respond(
        c,
        failure(400, 'VALIDATION_ERROR', '올바르지 않은 데이터입니다.'),
      );
    }

    const result = await updateCampaign(supabase, userId, campaignId, parsed.data);

    if (!result.ok) {
      logger.error('Update campaign failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Delete campaign
  app.delete('/campaigns/:id', withAuth(), async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c)!;

    const result = await deleteCampaign(supabase, userId, campaignId);

    if (!result.ok) {
      logger.error('Delete campaign failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Close recruitment (early termination)
  app.post('/campaigns/:id/close', withAuth(), async (c) => {
    const campaignId = c.req.param('id');
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c)!;

    const result = await closeRecruitment(supabase, userId, campaignId);

    if (!result.ok) {
      logger.error('Close recruitment failed', { error: (result as ErrorResult<CampaignErrorCode, unknown>).error });
    }

    return respond(c, result);
  });
};
