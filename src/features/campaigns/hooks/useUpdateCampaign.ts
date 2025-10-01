'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCampaign } from '../lib/api';

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
    },
  });
};
