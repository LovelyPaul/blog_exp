'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { useCurrentUserContext } from '../context/current-user-context';
import {
  LoginResponseSchema,
  type LoginRequest,
} from '../lib/dto';

const postLogin = async (request: LoginRequest) => {
  try {
    // 1. 클라이언트 세션 먼저 생성
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: request.email,
      password: request.password,
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
      }
      throw new Error(authError.message);
    }

    console.log('[Login] Client session created:', authData.session?.access_token?.substring(0, 20));

    // 2. 백엔드에서 사용자 정보 가져오기
    const { data } = await apiClient.post('/api/auth/login', request);
    return LoginResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, '로그인에 실패했습니다.');
    throw new Error(message);
  }
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refresh } = useCurrentUserContext();

  return useMutation({
    mutationFn: postLogin,
    onSuccess: async (data) => {
      // Context 새로고침 (이것이 핵심!)
      await refresh();

      // React Query 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      if (!data.onboardingCompleted) {
        router.push('/onboarding');
      } else if (data.role === 'advertiser') {
        router.push('/my/campaigns');
      } else {
        router.push('/');
      }
    },
  });
};