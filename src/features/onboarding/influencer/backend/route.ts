import type { Hono } from 'hono';
import { failure, respond, success, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, getUserId, type AppEnv } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/auth';
import { InfluencerProfileRequestSchema } from './schema';
import { createInfluencerProfile, updateInfluencerProfile } from './service';
import type { InfluencerErrorCode } from './error';

export const registerInfluencerOnboardingRoutes = (app: Hono<AppEnv>) => {
  app.post('/influencer/profile', withAuth(), async (c) => {
    const body = await c.req.json();
    const parsed = InfluencerProfileRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_PROFILE_REQUEST',
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

    const result = await createInfluencerProfile(
      supabase,
      userId,
      parsed.data,
    );

    if (!result.ok) {
      logger.error('Influencer profile creation failed', { error: (result as ErrorResult<InfluencerErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // Get influencer profile
  app.get('/influencer/profile', withAuth(), async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '인증되지 않은 사용자입니다.'),
      );
    }

    const { data, error } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      logger.error('Get influencer profile failed', { error });
      return respond(
        c,
        failure(404, 'PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.'),
      );
    }

    return respond(c, success(data));
  });

  // Update influencer profile
  app.patch('/influencer/profile', withAuth(), async (c) => {
    const body = await c.req.json();
    const parsed = InfluencerProfileRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_PROFILE_REQUEST',
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

    const result = await updateInfluencerProfile(
      supabase,
      userId,
      parsed.data,
    );

    if (!result.ok) {
      logger.error('Influencer profile update failed', { error: (result as ErrorResult<InfluencerErrorCode, unknown>).error });
    }

    return respond(c, result);
  });
};