# UC-001: 회원가입 & 역할선택 구현 계획

## 개요

### Backend Modules
| 모듈 | 위치 | 설명 |
|------|------|------|
| Auth Route | `src/features/auth/backend/route.ts` | 회원가입, 로그인, 로그아웃 API 엔드포인트 |
| Auth Service | `src/features/auth/backend/service.ts` | Supabase Auth 및 users 테이블 로직 |
| Auth Schema | `src/features/auth/backend/schema.ts` | 요청/응답 Zod 스키마 |
| Auth Error | `src/features/auth/backend/error.ts` | Auth 관련 에러 코드 정의 |

### Frontend Modules
| 모듈 | 위치 | 설명 |
|------|------|------|
| Signup Page | `src/app/signup/page.tsx` | 회원가입 페이지 |
| Signup Form | `src/features/auth/components/signup-form.tsx` | 회원가입 폼 컴포넌트 |
| Role Selector | `src/features/auth/components/role-selector.tsx` | 역할 선택 컴포넌트 |
| Terms Agreement | `src/features/auth/components/terms-agreement.tsx` | 약관 동의 컴포넌트 |
| Auth Hooks | `src/features/auth/hooks/useSignup.ts` | 회원가입 mutation hook |
| Auth Types | `src/features/auth/types.ts` | 공통 타입 정의 |

### Shared Modules
| 모듈 | 위치 | 설명 |
|------|------|------|
| Password Validator | `src/lib/validators/password.ts` | 비밀번호 정책 검증 |
| Email Validator | `src/lib/validators/email.ts` | 이메일 형식 검증 (Zod 기반) |
| Rate Limiter | `src/backend/middleware/rate-limit.ts` | API 레이트 리밋 미들웨어 |

---

## Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[signup/page.tsx] --> B[SignupForm]
        B --> C[RoleSelector]
        B --> D[TermsAgreement]
        B --> E[useSignup Hook]
        E --> F[apiClient]
    end

    subgraph "Backend Layer"
        F --> G[/api/auth/signup]
        G --> H[Auth Route]
        H --> I[Auth Service]
        I --> J[Supabase Auth]
        I --> K[users Table]
        I --> L[user_agreements Table]
        H --> M[Rate Limiter]
    end

    subgraph "Shared Layer"
        B --> N[Password Validator]
        B --> O[Email Validator]
        H --> P[Auth Schema]
        H --> Q[Auth Error]
    end

    style A fill:#e1f5ff
    style G fill:#fff4e1
    style I fill:#f0f0f0
```

---

## Implementation Plan

### 1. Backend Implementation

#### 1.1 Auth Schema (`src/features/auth/backend/schema.ts`)

**목적**: 회원가입 요청/응답 스키마 정의

**구현**:
```typescript
import { z } from 'zod';

// 회원가입 요청
export const SignupRequestSchema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
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
    terms: z.literal(true, { errorMap: () => ({ message: '이용약관 동의는 필수입니다.' }) }),
    privacy: z.literal(true, { errorMap: () => ({ message: '개인정보처리방침 동의는 필수입니다.' }) }),
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
```

**Unit Tests**:
```typescript
// src/features/auth/backend/schema.test.ts
describe('SignupRequestSchema', () => {
  it('이메일 형식이 올바르지 않으면 실패', () => {
    const result = SignupRequestSchema.safeParse({ email: 'invalid', password: 'Test123!', role: 'influencer', agreements: { terms: true, privacy: true } });
    expect(result.success).toBe(false);
  });

  it('비밀번호가 8자 미만이면 실패', () => {
    const result = SignupRequestSchema.safeParse({ email: 'test@example.com', password: 'Test1!', role: 'influencer', agreements: { terms: true, privacy: true } });
    expect(result.success).toBe(false);
  });

  it('비밀번호에 영문, 숫자, 특수문자가 모두 포함되면 성공', () => {
    const result = SignupRequestSchema.safeParse({ email: 'test@example.com', password: 'Test123!', role: 'influencer', agreements: { terms: true, privacy: true } });
    expect(result.success).toBe(true);
  });

  it('역할이 influencer 또는 advertiser가 아니면 실패', () => {
    const result = SignupRequestSchema.safeParse({ email: 'test@example.com', password: 'Test123!', role: 'admin', agreements: { terms: true, privacy: true } });
    expect(result.success).toBe(false);
  });

  it('필수 약관 동의가 없으면 실패', () => {
    const result = SignupRequestSchema.safeParse({ email: 'test@example.com', password: 'Test123!', role: 'influencer', agreements: { terms: false, privacy: true } });
    expect(result.success).toBe(false);
  });
});
```

---

#### 1.2 Auth Error (`src/features/auth/backend/error.ts`)

**목적**: Auth 관련 에러 코드 정의

**구현**:
```typescript
export const authErrorCodes = {
  emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
  invalidCredentials: 'INVALID_CREDENTIALS',
  passwordTooWeak: 'PASSWORD_TOO_WEAK',
  rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
  supabaseAuthError: 'SUPABASE_AUTH_ERROR',
  userCreationFailed: 'USER_CREATION_FAILED',
  agreementSaveFailed: 'AGREEMENT_SAVE_FAILED',
} as const;

export type AuthErrorCode = (typeof authErrorCodes)[keyof typeof authErrorCodes];

export type AuthServiceError = {
  code: AuthErrorCode;
  message: string;
};
```

---

#### 1.3 Auth Service (`src/features/auth/backend/service.ts`)

**목적**: 회원가입 비즈니스 로직 처리

**구현**:
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { authErrorCodes, type AuthServiceError } from './error';
import type { SignupRequest, SignupResponse } from './schema';

export const signupUser = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, AuthServiceError, unknown>> => {
  // 1. 이메일 중복 확인
  const { data: existingUser } = await client
    .from('users')
    .select('id')
    .eq('email', request.email)
    .maybeSingle();

  if (existingUser) {
    return failure(400, authErrorCodes.emailAlreadyExists, '이미 가입된 이메일입니다.');
  }

  // 2. Supabase Auth 계정 생성
  const { data: authData, error: authError } = await client.auth.signUp({
    email: request.email,
    password: request.password,
  });

  if (authError || !authData.user) {
    return failure(500, authErrorCodes.supabaseAuthError, authError?.message || 'Auth 계정 생성 실패');
  }

  // 3. users 테이블에 레코드 생성
  const { data: userData, error: userError } = await client
    .from('users')
    .insert({
      id: authData.user.id,
      email: request.email,
      role: request.role,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (userError || !userData) {
    // Rollback: Auth 계정 삭제 (선택)
    return failure(500, authErrorCodes.userCreationFailed, '사용자 정보 생성 실패');
  }

  // 4. user_agreements 테이블에 약관 동의 내역 저장
  const agreements = [
    { user_id: userData.id, agreement_type: 'terms', agreement_version: '1.0', is_agreed: true },
    { user_id: userData.id, agreement_type: 'privacy', agreement_version: '1.0', is_agreed: true },
  ];

  if (request.agreements.marketing) {
    agreements.push({
      user_id: userData.id,
      agreement_type: 'marketing',
      agreement_version: '1.0',
      is_agreed: true,
    });
  }

  const { error: agreementError } = await client.from('user_agreements').insert(agreements);

  if (agreementError) {
    return failure(500, authErrorCodes.agreementSaveFailed, '약관 동의 내역 저장 실패');
  }

  // 5. 성공 응답
  return success({
    userId: userData.id,
    email: userData.email,
    role: userData.role,
    needsOnboarding: true,
  });
};
```

**Unit Tests**:
```typescript
// src/features/auth/backend/service.test.ts
describe('signupUser', () => {
  it('이메일 중복 시 실패 반환', async () => {
    // Mock Supabase client
    const mockClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'existing-id' } }),
          }),
        }),
      }),
    };

    const result = await signupUser(mockClient as any, {
      email: 'test@example.com',
      password: 'Test123!',
      role: 'influencer',
      agreements: { terms: true, privacy: true },
    });

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe(authErrorCodes.emailAlreadyExists);
  });

  it('Auth 계정 생성 실패 시 실패 반환', async () => {
    const mockClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: null, error: { message: 'Auth error' } }),
      },
    };

    const result = await signupUser(mockClient as any, {
      email: 'test@example.com',
      password: 'Test123!',
      role: 'influencer',
      agreements: { terms: true, privacy: true },
    });

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe(authErrorCodes.supabaseAuthError);
  });

  it('정상 회원가입 시 성공 응답', async () => {
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
    const mockClient = {
      from: jest.fn((table: string) => {
        if (table === 'users' && mockClient.from.mock.calls.length === 1) {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: null }),
              }),
            }),
          };
        }
        if (table === 'users') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: mockUserId, email: 'test@example.com', role: 'influencer' },
                }),
              }),
            }),
          };
        }
        if (table === 'user_agreements') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
      }),
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        }),
      },
    };

    const result = await signupUser(mockClient as any, {
      email: 'test@example.com',
      password: 'Test123!',
      role: 'influencer',
      agreements: { terms: true, privacy: true },
    });

    expect(result.ok).toBe(true);
    expect(result.data.userId).toBe(mockUserId);
    expect(result.data.needsOnboarding).toBe(true);
  });
});
```

---

#### 1.4 Auth Route (`src/features/auth/backend/route.ts`)

**목적**: API 엔드포인트 정의

**구현**:
```typescript
import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { SignupRequestSchema } from './schema';
import { signupUser } from './service';
import { authErrorCodes } from './error';

export const registerAuthRoutes = (app: Hono<AppEnv>) => {
  app.post('/auth/signup', async (c) => {
    const body = await c.req.json();
    const parsed = SignupRequestSchema.safeParse(body);

    if (!parsed.success) {
      return respond(
        c,
        failure(400, 'INVALID_SIGNUP_REQUEST', '입력값이 유효하지 않습니다.', parsed.error.format()),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await signupUser(supabase, parsed.data);

    if (!result.ok) {
      logger.error('Signup failed', result.error);
    }

    return respond(c, result);
  });
};
```

---

### 2. Frontend Implementation

#### 2.1 Signup Hook (`src/features/auth/hooks/useSignup.ts`)

**목적**: 회원가입 mutation hook

**구현**:
```typescript
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { SignupResponseSchema, type SignupRequest } from '../lib/dto';

const postSignup = async (request: SignupRequest) => {
  try {
    const { data } = await apiClient.post('/api/auth/signup', request);
    return SignupResponseSchema.parse(data);
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
      // 역할에 따라 온보딩 페이지로 리다이렉트
      router.push('/onboarding');
    },
  });
};
```

---

#### 2.2 Signup Form (`src/features/auth/components/signup-form.tsx`)

**목적**: 회원가입 폼 컴포넌트

**구현**:
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignup } from '../hooks/useSignup';
import { RoleSelector } from './role-selector';
import { TermsAgreement } from './terms-agreement';
import { SignupRequestSchema } from '../lib/dto';

type SignupFormData = z.infer<typeof SignupRequestSchema>;

export const SignupForm = () => {
  const { mutate, isPending } = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      agreements: {
        terms: false,
        privacy: false,
        marketing: false,
      },
    },
  });

  const onSubmit = (data: SignupFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="email">이메일</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        <p className="text-xs text-gray-500 mt-1">
          8자 이상, 영문+숫자+특수문자 포함
        </p>
      </div>

      <RoleSelector value={watch('role')} onChange={(role) => setValue('role', role)} />
      {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}

      <TermsAgreement
        values={watch('agreements')}
        onChange={(field, value) => setValue(`agreements.${field}`, value)}
      />
      {errors.agreements && (
        <p className="text-sm text-red-500">
          {errors.agreements.terms?.message || errors.agreements.privacy?.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '가입 중...' : '가입하기'}
      </Button>
    </form>
  );
};
```

**QA Sheet**:
```markdown
## SignupForm QA Checklist

### 입력 검증
- [ ] 이메일 형식이 올바르지 않으면 에러 메시지 표시
- [ ] 비밀번호가 8자 미만이면 에러 메시지 표시
- [ ] 비밀번호에 영문이 없으면 에러 메시지 표시
- [ ] 비밀번호에 숫자가 없으면 에러 메시지 표시
- [ ] 비밀번호에 특수문자가 없으면 에러 메시지 표시
- [ ] 역할을 선택하지 않으면 제출 불가
- [ ] 필수 약관 미동의 시 에러 메시지 표시

### 기능 동작
- [ ] 역할 선택 시 UI 업데이트 확인
- [ ] 약관 체크박스 동작 확인
- [ ] 제출 중 버튼 비활성화 확인
- [ ] 제출 성공 시 온보딩 페이지로 리다이렉트

### 에러 처리
- [ ] 이메일 중복 시 에러 토스트 표시
- [ ] 네트워크 에러 시 재시도 가능
- [ ] 서버 에러 시 적절한 메시지 표시

### 접근성
- [ ] 키보드 네비게이션 동작
- [ ] 스크린 리더 호환성
- [ ] 에러 메시지 ARIA 속성 확인
```

---

#### 2.3 Role Selector (`src/features/auth/components/role-selector.tsx`)

**목적**: 역할 선택 컴포넌트

**구현**:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Role = 'influencer' | 'advertiser';

type RoleSelectorProps = {
  value?: Role;
  onChange: (role: Role) => void;
};

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">역할 선택</p>
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={cn(
            'p-4 cursor-pointer hover:border-primary transition-colors',
            value === 'influencer' && 'border-primary bg-primary/5',
          )}
          onClick={() => onChange('influencer')}
        >
          <h3 className="font-semibold">인플루언서</h3>
          <p className="text-sm text-gray-600">체험단에 지원하고 리뷰를 작성합니다</p>
        </Card>

        <Card
          className={cn(
            'p-4 cursor-pointer hover:border-primary transition-colors',
            value === 'advertiser' && 'border-primary bg-primary/5',
          )}
          onClick={() => onChange('advertiser')}
        >
          <h3 className="font-semibold">광고주</h3>
          <p className="text-sm text-gray-600">체험단을 등록하고 관리합니다</p>
        </Card>
      </div>
    </div>
  );
};
```

---

#### 2.4 Terms Agreement (`src/features/auth/components/terms-agreement.tsx`)

**목적**: 약관 동의 컴포넌트

**구현**:
```typescript
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type AgreementValues = {
  terms: boolean;
  privacy: boolean;
  marketing?: boolean;
};

type TermsAgreementProps = {
  values: AgreementValues;
  onChange: (field: keyof AgreementValues, value: boolean) => void;
};

export const TermsAgreement = ({ values, onChange }: TermsAgreementProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">약관 동의</p>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={values.terms}
          onCheckedChange={(checked) => onChange('terms', checked === true)}
        />
        <Label htmlFor="terms" className="text-sm">
          <span className="text-red-500">*</span> 이용약관 동의
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="privacy"
          checked={values.privacy}
          onCheckedChange={(checked) => onChange('privacy', checked === true)}
        />
        <Label htmlFor="privacy" className="text-sm">
          <span className="text-red-500">*</span> 개인정보처리방침 동의
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketing"
          checked={values.marketing || false}
          onCheckedChange={(checked) => onChange('marketing', checked === true)}
        />
        <Label htmlFor="marketing" className="text-sm">
          마케팅 수신 동의 (선택)
        </Label>
      </div>
    </div>
  );
};
```

---

#### 2.5 Signup Page (`src/app/signup/page.tsx`)

**목적**: 회원가입 페이지

**구현**:
```typescript
'use client';

import { SignupForm } from '@/features/auth/components/signup-form';
import { Card } from '@/components/ui/card';

export default async function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
        <SignupForm />
      </Card>
    </div>
  );
}
```

---

### 3. Hono App Registration

**위치**: `src/backend/hono/app.ts`

**수정**:
```typescript
import { registerAuthRoutes } from '@/features/auth/backend/route';

export const createHonoApp = () => {
  // ... existing code ...

  registerAuthRoutes(app);  // 추가

  // ... existing code ...
};
```

---

### 4. Shared Utilities

#### 4.1 Password Validator (`src/lib/validators/password.ts`)

**구현**:
```typescript
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push('영문자를 포함해야 합니다.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 포함해야 합니다.');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('특수문자를 포함해야 합니다.');
  }

  return { valid: errors.length === 0, errors };
};
```

---

## Shadcn UI Components Required

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add checkbox
npx shadcn@latest add card
```

---

## Testing Checklist

### Backend Tests
- [ ] SignupRequestSchema 유효성 검증 테스트
- [ ] signupUser 서비스 로직 테스트
- [ ] 이메일 중복 확인 테스트
- [ ] Supabase Auth 에러 처리 테스트
- [ ] 약관 동의 저장 테스트

### Frontend Tests
- [ ] SignupForm 입력 검증 테스트
- [ ] RoleSelector 선택 동작 테스트
- [ ] TermsAgreement 체크박스 테스트
- [ ] useSignup 훅 mutation 테스트
- [ ] 회원가입 성공 시 리다이렉트 테스트

### Integration Tests
- [ ] 회원가입 E2E 플로우 테스트
- [ ] 에러 처리 시나리오 테스트
- [ ] 역할별 온보딩 페이지 리다이렉트 테스트