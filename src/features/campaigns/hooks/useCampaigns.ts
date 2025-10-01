'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getCampaigns } from '../lib/api';
import type { CampaignListQuery } from '../lib/dto';

export const useCampaigns = (query: Partial<CampaignListQuery>) => {
  return useInfiniteQuery({
    queryKey: ['campaigns', query],
    queryFn: ({ pageParam = 0 }) =>
      getCampaigns({
        ...query,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) return undefined;
      return allPages.length * (query.limit || 20);
    },
    initialPageParam: 0,
  });
};
