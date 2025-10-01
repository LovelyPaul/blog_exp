import { handle } from 'hono/vercel';
import { createHonoApp } from '@/backend/hono/app';

const app = createHonoApp();
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;

export const runtime = 'nodejs';
