'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getCampaignApplicants } from '../lib/api';
import type { CampaignApplicantQuery } from '../lib/dto';

export const useCampaignApplicants = (
  campaignId: string,
  query: Partial<CampaignApplicantQuery>,
) => {
  return useInfiniteQuery({
    queryKey: ['campaign-applicants', campaignId, query],
    queryFn: ({ pageParam = 0 }) =>
      getCampaignApplicants(campaignId, {
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
