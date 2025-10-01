'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getAdvertiserCampaigns } from '../lib/api';
import type { AdvertiserCampaignQuery } from '../lib/dto';

export const useAdvertiserCampaigns = (
  query: Partial<AdvertiserCampaignQuery>,
) => {
  return useInfiniteQuery({
    queryKey: ['advertiser-campaigns', query],
    queryFn: ({ pageParam = 0 }) =>
      getAdvertiserCampaigns({
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
