'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { InfluencerProfileRequest } from '../lib/dto';

const updateInfluencerProfile = async (request: InfluencerProfileRequest) => {
  const { data } = await apiClient.patch('/api/influencer/profile', request);
  return data;
};

export const useUpdateInfluencerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInfluencerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error, '프로필 업데이트에 실패했습니다.');
      throw new Error(message);
    },
  });
};
