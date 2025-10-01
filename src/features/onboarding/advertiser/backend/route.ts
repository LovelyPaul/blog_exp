import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, getUserId, type AppEnv } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/auth';
import { AdvertiserProfileRequestSchema } from './schema';
import { createAdvertiserProfile } from './service';
import type { AdvertiserErrorCode } from './error';

export const registerAdvertiserOnboardingRoutes = (app: Hono<AppEnv>) => {
  app.post('/advertiser/profile', withAuth(), async (c) => {
    const body = await c.req.json();
    const parsed = AdvertiserProfileRequestSchema.safeParse(body);

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

    const result = await createAdvertiserProfile(
      supabase,
      userId,
      parsed.data,
    );

    if (!result.ok) {
      logger.error('Advertiser profile creation failed', { error: (result as ErrorResult<AdvertiserErrorCode, unknown>).error });
    }

    return respond(c, result);
  });
};
