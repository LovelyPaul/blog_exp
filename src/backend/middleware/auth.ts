import { createMiddleware } from 'hono/factory';
import { contextKeys, type AppEnv } from '@/backend/hono/context';

export const withAuth = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const authHeader = c.req.header('Authorization');

    // 디버깅 로그
    console.log('[withAuth] Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : 'missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증되지 않은 사용자입니다.',
          },
        },
        401,
      );
    }

    const token = authHeader.substring(7);
    const supabase = c.get(contextKeys.supabase);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '유효하지 않은 토큰입니다.',
          },
        },
        401,
      );
    }

    // Context에 userId 저장
    c.set(contextKeys.userId, user.id);

    await next();
  });
