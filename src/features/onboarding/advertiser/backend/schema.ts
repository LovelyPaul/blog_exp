import { z } from 'zod';
import { validateBusinessNumber } from '@/lib/validators/business-number';

export const AdvertiserProfileRequestSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다.')
    .max(50, '이름은 50자 이하여야 합니다.'),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  business_name: z
    .string()
    .min(2, '업체명은 2자 이상이어야 합니다.')
    .max(100, '업체명은 100자 이하여야 합니다.'),
  business_number: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, '올바른 사업자등록번호 형식이 아닙니다.')
    .refine(
      (num) => validateBusinessNumber(num),
      { message: '유효하지 않은 사업자등록번호입니다.' },
    ),
  representative_name: z
    .string()
    .min(2, '대표자명은 2자 이상이어야 합니다.')
    .max(50, '대표자명은 50자 이하여야 합니다.')
    .optional(),
  category: z.enum([
    'food',
    'fashion',
    'beauty',
    'life',
    'digital',
    'health',
    'kids',
    'pet',
    'culture',
    'travel',
    'education',
    'other',
  ], { message: '업종 카테고리를 선택해주세요.' }),
  address: z.string().min(5, '주소를 입력해주세요.'),
  address_detail: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type AdvertiserProfileRequest = z.infer<
  typeof AdvertiserProfileRequestSchema
>;

export const AdvertiserProfileResponseSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  businessName: z.string(),
});

export type AdvertiserProfileResponse = z.infer<
  typeof AdvertiserProfileResponseSchema
>;
