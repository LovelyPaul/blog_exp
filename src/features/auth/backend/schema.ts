import { z } from 'zod';

// 회원가입 요청
export const SignupRequestSchema = z.object({
  email: z
    .string()
    .email({ message: '유효한 이메일을 입력해주세요.' })
    .refine(
      (email) => {
        // @example.com, @test.com 등의 테스트 도메인 차단
        const invalidDomains = ['example.com', 'test.com', 'localhost'];
        const domain = email.split('@')[1]?.toLowerCase();
        return !invalidDomains.includes(domain);
      },
      { message: '유효하지 않은 이메일 도메인입니다. 실제 이메일 주소를 사용해주세요.' }
    ),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.')
    .regex(/[!@#$%^&*]/, '특수문자를 포함해야 합니다.'),
  role: z.enum(['influencer', 'advertiser'], {
    errorMap: () => ({ message: '역할을 선택해주세요.' }),
  }),
  agreements: z.object({
    terms: z.literal(true, {
      errorMap: () => ({ message: '이용약관 동의는 필수입니다.' }),
    }),
    privacy: z.literal(true, {
      errorMap: () => ({ message: '개인정보처리방침 동의는 필수입니다.' }),
    }),
    marketing: z.boolean().optional(),
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

// 회원가입 응답
export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['influencer', 'advertiser']),
  needsOnboarding: z.boolean(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

// 로그인 요청
export const LoginRequestSchema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// 로그인 응답
export const LoginResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['influencer', 'advertiser']),
  onboardingCompleted: z.boolean(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// 현재 사용자 응답
export const CurrentUserResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['influencer', 'advertiser']),
  onboardingCompleted: z.boolean(),
});

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;