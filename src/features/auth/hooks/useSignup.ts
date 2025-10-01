'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  SignupResponseSchema,
  type SignupRequest,
} from '../lib/dto';

const postSignup = async (request: SignupRequest) => {
  try {
    const { data } = await apiClient.post('/api/auth/signup', request);
    const result = SignupResponseSchema.parse(data);
    return { ...result, email: request.email };
  } catch (error) {
    const message = extractApiErrorMessage(error, '회원가입에 실패했습니다.');
    throw new Error(message);
  }
};

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: postSignup,
    onSuccess: (data) => {
      // 이메일 확인 페이지로 이동
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    },
  });
};