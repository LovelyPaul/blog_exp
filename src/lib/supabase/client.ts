// Re-export browser client for backward compatibility
export { getSupabaseBrowserClient as createSupabaseClient } from './browser-client';

// Deprecated: use getSupabaseBrowserClient() instead
import { getSupabaseBrowserClient } from './browser-client';
export const supabase = getSupabaseBrowserClient();
