'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateAdvertiserProfile } from '../hooks/useCreateProfile';
import {
  AdvertiserProfileRequestSchema,
  type AdvertiserProfileRequest,
} from '../lib/dto';
import { formatPhoneNumber } from '@/lib/formatters/phone';
import { formatBusinessNumber } from '@/lib/validators/business-number';

const CATEGORIES = [
  { value: 'food', label: '식품/음료' },
  { value: 'fashion', label: '패션/의류' },
  { value: 'beauty', label: '뷰티/화장품' },
  { value: 'life', label: '생활용품' },
  { value: 'digital', label: '디지털/가전' },
  { value: 'health', label: '건강/운동' },
  { value: 'kids', label: '유아/아동' },
  { value: 'pet', label: '반려동물' },
  { value: 'culture', label: '문화/레저' },
  { value: 'travel', label: '여행/숙박' },
  { value: 'education', label: '교육/학습' },
  { value: 'other', label: '기타' },
] as const;

export const AdvertiserProfileForm = () => {
  const { mutate, isPending } = useCreateAdvertiserProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AdvertiserProfileRequest>({
    resolver: zodResolver(AdvertiserProfileRequestSchema),
  });

  const phoneValue = watch('phone');
  const businessNumberValue = watch('business_number');
  const categoryValue = watch('category');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted);
  };

  const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBusinessNumber(e.target.value);
    setValue('business_number', formatted);
  };

  const onSubmit = (data: AdvertiserProfileRequest) => {
    mutate(data, {
      onError: (error) => {
        toast({
          title: '프로필 생성 실패',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">광고주 정보 입력</h2>

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
          <Label htmlFor="business_name">
            <span className="text-red-500">*</span> 업체명
          </Label>
          <Input
            id="business_name"
            {...register('business_name')}
            placeholder="업체명을 입력하세요"
          />
          {errors.business_name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.business_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="business_number">
            <span className="text-red-500">*</span> 사업자등록번호
          </Label>
          <Input
            id="business_number"
            value={businessNumberValue || ''}
            onChange={handleBusinessNumberChange}
            placeholder="000-00-00000"
            maxLength={12}
          />
          {errors.business_number && (
            <p className="text-sm text-red-500 mt-1">
              {errors.business_number.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="representative_name">대표자명 (선택)</Label>
          <Input
            id="representative_name"
            {...register('representative_name')}
            placeholder="대표자명을 입력하세요"
          />
          {errors.representative_name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.representative_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="category">
            <span className="text-red-500">*</span> 업종 카테고리
          </Label>
          <Select
            value={categoryValue}
            onValueChange={(value) => setValue('category', value as any)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="업종을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="address">
            <span className="text-red-500">*</span> 주소
          </Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="주소를 입력하세요"
          />
          {errors.address && (
            <p className="text-sm text-red-500 mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="address_detail">상세주소 (선택)</Label>
          <Input
            id="address_detail"
            {...register('address_detail')}
            placeholder="상세주소를 입력하세요"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '등록 중...' : '프로필 등록'}
        </Button>
      </form>
    </Card>
  );
};
