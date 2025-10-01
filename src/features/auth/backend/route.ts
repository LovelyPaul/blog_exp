import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, getUserId, type AppEnv } from '@/backend/hono/context';
import { withAuth } from '@/backend/middleware/auth';
import {
  SignupRequestSchema,
  LoginRequestSchema,
} from './schema';
import {
  signupUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from './service';
import type { AuthErrorCode } from './error';

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  // 회원가입
  app.post('/auth/signup', async (c) => {
    const body = await c.req.json();
    const parsed = SignupRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_SIGNUP_REQUEST',
          '입력값이 유효하지 않습니다.',
          parsed.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await signupUser(supabase, parsed.data);

    if (!result.ok) {
      logger.error('Signup failed', { error: (result as ErrorResult<AuthErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // 로그인
  app.post('/auth/login', async (c) => {
    const body = await c.req.json();
    const parsed = LoginRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_LOGIN_REQUEST',
          '입력값이 유효하지 않습니다.',
          parsed.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await loginUser(supabase, parsed.data);

    if (!result.ok) {
      logger.error('Login failed', { error: (result as ErrorResult<AuthErrorCode, unknown>).error });
    }

    return respond(c, result);
  });

  // 현재 사용자 조회
  app.get('/auth/me', withAuth(), async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const userId = getUserId(c);

    if (!userId) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', '인증되지 않은 사용자입니다.'),
      );
    }

    // userId로 직접 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, onboarding_completed')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      logger.error('Get current user failed', { error: userError });
      return respond(
        c,
        failure(404, 'USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.'),
      );
    }

    return respond(c, {
      ok: true,
      status: 200,
      data: {
        userId: userData.id,
        email: userData.email,
        role: userData.role as 'influencer' | 'advertiser',
        onboardingCompleted: userData.onboarding_completed,
      },
    });
  });

  // 로그아웃
  app.post('/auth/logout', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await logoutUser(supabase);

    if (!result.ok) {
      logger.error('Logout failed', { error: (result as ErrorResult<AuthErrorCode, unknown>).error });
    }

    return respond(c, result);
  });
};