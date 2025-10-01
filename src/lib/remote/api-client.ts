import axios, { isAxiosError } from "axios";
import { supabase } from "@/lib/supabase/client";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include Supabase session token
apiClient.interceptors.request.use(async (config) => {
  console.log('[API Client] Request interceptor called for:', config.url);

  // 먼저 getSession() 시도
  let {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('[API Client] Session from getSession():', session ? 'found' : 'not found');

  // 세션이 없거나 만료된 경우 refreshSession() 시도
  if (!session || (session.expires_at && session.expires_at * 1000 < Date.now())) {
    console.log('[API Client] Session missing or expired, attempting to refresh...');
    const { data } = await supabase.auth.refreshSession();
    session = data.session;
    console.log('[API Client] Session after refresh:', session ? 'found' : 'not found');
  }

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    console.log('[API Client] Adding Authorization header:', `Bearer ${session.access_token.substring(0, 20)}...`);
  } else {
    console.log('[API Client] No session token found after refresh');

    // localStorage 키 확인 (디버깅용)
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'));
      console.log('[API Client] localStorage keys containing supabase:', keys);
    }
  }

  return config;
});

type ErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage = "API request failed."
) => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export { apiClient, isAxiosError };
