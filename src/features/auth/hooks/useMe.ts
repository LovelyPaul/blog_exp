'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { useCurrentUserContext } from '@/features/auth/context/current-user-context';

export interface MeResponse {
  id: string;
  email: string;
  role: 'influencer' | 'advertiser';
  onboardingCompleted: boolean;
}

const fetchMe = async (): Promise<MeResponse> => {
  const { data } = await apiClient.get('/api/auth/me');
  return data;
};

export const useMe = () => {
  const { isAuthenticated } = useCurrentUserContext();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    retry: false,
  });
};
