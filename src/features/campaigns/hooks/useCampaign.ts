'use client';

import { useQuery } from '@tanstack/react-query';
import { getCampaignById } from '../lib/api';

export const useCampaign = (campaignId: string) => {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => getCampaignById(campaignId),
    enabled: !!campaignId,
  });
};
