'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyApplications } from '../lib/api';
import type { MyApplicationQuery } from '../lib/dto';

export const useMyApplications = (query: Partial<MyApplicationQuery>) => {
  return useInfiniteQuery({
    queryKey: ['my-applications', query],
    queryFn: ({ pageParam = 0 }) =>
      getMyApplications({
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
