import { z } from 'zod';
import { isAdult } from '@/lib/validators/age';

const SNSChannelSchema = z.object({
  type: z.enum(['naver', 'youtube', 'instagram', 'threads']),
  channel_name: z.string().min(1, '채널명을 입력해주세요.'),
  url: z.string().url('유효한 URL을 입력해주세요.'),
});

export const InfluencerProfileRequestSchema = z.object({
  name: z
    .string()
    .min(2, '이름은 2자 이상이어야 합니다.')
    .max(50, '이름은 50자 이하여야 합니다.'),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  birth_date: z.string().refine(
    (date) => {
      return isAdult(date, 14);
    },
    { message: '만 14세 이상만 가입 가능합니다.' },
  ),
  sns_channels: z
    .array(SNSChannelSchema)
    .min(1, 'SNS 채널을 최소 1개 등록해주세요.')
    .max(4, 'SNS 채널은 최대 4개까지 등록 가능합니다.'),
  categories: z.array(z.string()).optional(),
});

export type InfluencerProfileRequest = z.infer<
  typeof InfluencerProfileRequestSchema
>;

export const InfluencerProfileResponseSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
});

export type InfluencerProfileResponse = z.infer<
  typeof InfluencerProfileResponseSchema
>;