'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCampaign } from '../lib/api';

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
    },
  });
};
