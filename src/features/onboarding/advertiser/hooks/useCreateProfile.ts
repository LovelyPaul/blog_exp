'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { postAdvertiserProfile } from '../lib/api';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';

export const useCreateAdvertiserProfile = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { refresh } = useCurrentUserContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAdvertiserProfile,
    onSuccess: async () => {
      // 사용자 정보 갱신 (onboarding_completed = true로 업데이트)
      await refresh();

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      toast({
        title: '프로필 등록 완료',
        description: '광고주 프로필이 성공적으로 등록되었습니다.',
      });

      router.push('/my/campaigns');
    },
  });
};
