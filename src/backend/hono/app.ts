import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import { registerInfluencerOnboardingRoutes } from '@/features/onboarding/influencer/backend/route';
import { registerAdvertiserOnboardingRoutes } from '@/features/onboarding/advertiser/backend/route';
import { registerCampaignRoutes } from '@/features/campaigns/backend/route';
import { registerApplicationRoutes } from '@/features/applications/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>().basePath('/api');

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  registerAuthRoutes(app);
  registerInfluencerOnboardingRoutes(app);
  registerAdvertiserOnboardingRoutes(app);
  registerCampaignRoutes(app);
  registerApplicationRoutes(app);
  registerExampleRoutes(app);

  singletonApp = app;

  return app;
};
