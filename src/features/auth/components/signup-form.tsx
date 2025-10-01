'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSignup } from '../hooks/useSignup';
import { RoleSelector } from './role-selector';
import { TermsAgreement } from './terms-agreement';
import { SignupRequestSchema, type SignupRequest } from '../lib/dto';

export const SignupForm = () => {
  const { mutate, isPending } = useSignup();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      email: '',
      password: '',
      agreements: {
        marketing: false,
      },
    } as any,
  });

  const onSubmit = (data: SignupRequest) => {
    mutate(data, {
      onError: (error) => {
        toast({
          title: '회원가입 실패',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          8자 이상, 영문+숫자+특수문자 포함
        </p>
      </div>

      <RoleSelector
        value={watch('role')}
        onChange={(role) => setValue('role', role)}
      />
      {errors.role && (
        <p className="text-sm text-red-500">{errors.role.message}</p>
      )}

      <TermsAgreement
        values={watch('agreements')}
        onChange={(field, value) => setValue(`agreements.${field}`, value)}
      />
      {(errors.agreements?.terms || errors.agreements?.privacy) && (
        <p className="text-sm text-red-500">
          {errors.agreements.terms?.message ||
            errors.agreements.privacy?.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '가입 중...' : '가입하기'}
      </Button>
    </form>
  );
};