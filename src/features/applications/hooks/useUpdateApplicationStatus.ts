'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateApplicationStatus } from '../lib/api';

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateApplicationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applicants'] });
    },
  });
};
