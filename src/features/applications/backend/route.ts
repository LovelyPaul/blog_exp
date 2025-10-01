import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, getUserId, type AppEnv } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/auth';
import {
  ApplicationRequestSchema,
  MyApplicationQuerySchema,
  CampaignApplicantQuerySchema,
  UpdateApplicationStatusRequestSchema,
} from './schema';
import {
  createApplication,
  getMyApplications,
  getCampaignApplicants,
  updateApplicationStatus,
} from './service';
import type { ApplicationErrorCode } from './error';

export const registerApplicationRoutes = (app: Hono<AppEnv>) => {
  // Create application
  app.post('/campaigns/:id/applications', withAuth(), async (c) => {
    const campaignId = c.req.param('id');
    const body = await c.req.json();
    const parsed = ApplicationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_APPLICATION_REQUEST',
          '입력값이 유효하지 않습니다.',
          parsed.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '인증되지 않은 사용자입니다.'),
      );
    }

    const result = await createApplication(
      supabase,
      campaignId,
      userId,
      parsed.data,
    );

    if (!result.ok) {
      logger.error('Application creation failed', { error: (result as ErrorResult<ApplicationErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Get my applications
  app.get('/my/applications', withAuth(), async (c) => {
    const queryParams = c.req.query();
    const parsed = MyApplicationQuerySchema.safeParse(queryParams);

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '인증되지 않은 사용자입니다.'),
      );
    }

    const result = await getMyApplications(
      supabase,
      userId,
      parsed.success ? parsed.data : MyApplicationQuerySchema.parse({}),
    );

    if (!result.ok) {
      logger.error('Get my applications failed', { error: (result as ErrorResult<ApplicationErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Get campaign applicants (advertiser only)
  app.get('/campaigns/:id/applicants', withAuth(), async (c) => {
    const campaignId = c.req.param('id');
    const queryParams = c.req.query();
    const parsed = CampaignApplicantQuerySchema.safeParse(queryParams);

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '인증되지 않은 사용자입니다.'),
      );
    }

    const result = await getCampaignApplicants(
      supabase,
      campaignId,
      userId,
      parsed.success ? parsed.data : CampaignApplicantQuerySchema.parse({}),
    );

    if (!result.ok) {
      logger.error('Get campaign applicants failed', { error: (result as ErrorResult<ApplicationErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Update application status (advertiser only)
  app.patch('/applications/:id/status', withAuth(), async (c) => {
    const applicationId = c.req.param('id');
    const body = await c.req.json();
    const parsed = UpdateApplicationStatusRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_STATUS_REQUEST',
          '입력값이 유효하지 않습니다.',
          parsed.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '인증되지 않은 사용자입니다.'),
      );
    }

    const result = await updateApplicationStatus(
      supabase,
      applicationId,
      userId,
      parsed.data,
    );

    if (!result.ok) {
      logger.error('Update application status failed', { error: (result as ErrorResult<ApplicationErrorCode, unknown>).error });
    }

    return respond(c, result);
  });
};
