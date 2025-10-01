'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export const useGetInfluencerProfile = () => {
  return useQuery({
    queryKey: ['influencer', 'profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/influencer/profile');
      return data;
    },
  });
};
