'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { postApplication } from '../lib/api';

export const useCreateApplication = (campaignId: string) => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: Parameters<typeof postApplication>[1]) =>
      postApplication(campaignId, data),
    onSuccess: () => {
      router.push('/my/applications');
    },
  });
};
