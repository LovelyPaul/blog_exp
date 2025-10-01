'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCampaign } from '../lib/api';

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
    },
  });
};
