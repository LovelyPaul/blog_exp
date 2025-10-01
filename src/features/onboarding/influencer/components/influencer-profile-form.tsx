'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateInfluencerProfile } from '../hooks/useCreateProfile';
import { useGetInfluencerProfile } from '../hooks/useGetProfile';
import { useUpdateInfluencerProfile } from '../hooks/useUpdateProfile';
import { SNSChannelInput } from './sns-channel-input';
import {
  InfluencerProfileRequestSchema,
  type InfluencerProfileRequest,
} from '../lib/dto';
import { formatPhoneNumber } from '@/lib/formatters/phone';

type InfluencerProfileFormProps = {
  isEditMode?: boolean;
};

export const InfluencerProfileForm = ({ isEditMode = false }: InfluencerProfileFormProps) => {
  const router = useRouter();
  const { mutate: createMutate, isPending: isCreating } = useCreateInfluencerProfile();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateInfluencerProfile();
  const { data: profileData, isLoading: isLoadingProfile } = useGetInfluencerProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
  } = useForm<InfluencerProfileRequest>({
    resolver: zodResolver(InfluencerProfileRequestSchema),
    defaultValues: {
      sns_channels: [{ type: 'naver', channel_name: '', url: '' }],
      categories: [],
    },
  });

  useEffect(() => {
    if (isEditMode && profileData) {
      reset({
        name: profileData.name,
        phone: profileData.phone,
        birth_date: profileData.birth_date,
        sns_channels: profileData.sns_channels,
        categories: profileData.categories || [],
      });
    }
  }, [isEditMode, profileData, reset]);

  const phoneValue = watch('phone');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted);
  };

  const onSubmit = (data: InfluencerProfileRequest) => {
    if (isEditMode) {
      updateMutate(data, {
        onSuccess: () => {
          toast({
            title: '프로필 수정 완료',
            description: '프로필이 성공적으로 수정되었습니다.',
          });
          router.push('/');
        },
        onError: (error) => {
          toast({
            title: '프로필 수정 실패',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      createMutate(data, {
        onError: (error) => {
          toast({
            title: '프로필 생성 실패',
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  if (isEditMode && isLoadingProfile) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <p>프로필 로딩 중...</p>
      </Card>
    );
  }

  const isPending = isCreating || isUpdating;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? '인플루언서 프로필 수정' : '인플루언서 정보 입력'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">
            <span className="text-red-500">*</span> 이름
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="이름을 입력하세요"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">
            <span className="text-red-500">*</span> 휴대폰 번호
          </Label>
          <Input
            id="phone"
            value={phoneValue || ''}
            onChange={handlePhoneChange}
            placeholder="010-0000-0000"
            maxLength={13}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="birth_date">
            <span className="text-red-500">*</span> 생년월일
          </Label>
          <Input
            id="birth_date"
            type="date"
            {...register('birth_date')}
          />
          {errors.birth_date && (
            <p className="text-sm text-red-500 mt-1">
              {errors.birth_date.message}
            </p>
          )}
        </div>

        <Controller
          name="sns_channels"
          control={control}
          render={({ field }) => (
            <SNSChannelInput
              channels={field.value}
              onChange={field.onChange}
              errors={
                errors.sns_channels
                  ? Array.isArray(errors.sns_channels)
                    ? errors.sns_channels.map((e) => e?.message).filter(Boolean) as string[]
                    : [errors.sns_channels.message].filter(Boolean) as string[]
                  : []
              }
            />
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? (isEditMode ? '수정 중...' : '등록 중...')
            : (isEditMode ? '프로필 수정' : '프로필 등록')
          }
        </Button>
      </form>
    </Card>
  );
};
