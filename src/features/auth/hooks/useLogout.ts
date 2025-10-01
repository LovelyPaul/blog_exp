'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';

const postLogout = async () => {
  try {
    // 1. Supabase 세션 제거 (먼저)
    await supabase.auth.signOut();

    // 2. 백엔드 로그아웃
    await apiClient.post('/api/auth/logout');
  } catch (error) {
    // 에러가 발생해도 Supabase 세션은 제거
    await supabase.auth.signOut();
    const message = extractApiErrorMessage(error, '로그아웃에 실패했습니다.');
    throw new Error(message);
  }
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refresh } = useCurrentUserContext();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: async () => {
      // React Query 캐시 초기화
      queryClient.clear();
      // 인증 상태 갱신
      await refresh();
      // 로그인 페이지로 이동
      router.push('/login');
    },
    onError: async () => {
      // 에러가 발생해도 클라이언트 측 세션 정리
      queryClient.clear();
      await refresh();
      router.push('/login');
    },
  });
};