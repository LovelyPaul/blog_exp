# UC-002: 인플루언서 정보 등록 구현 계획

## 개요

### Backend Modules
| 모듈 | 위치 | 설명 |
|------|------|------|
| Influencer Profile Route | `src/features/onboarding/influencer/backend/route.ts` | 인플루언서 프로필 등록/조회 API |
| Influencer Profile Service | `src/features/onboarding/influencer/backend/service.ts` | SNS 채널 검증, 프로필 생성 로직 |
| Influencer Schema | `src/features/onboarding/influencer/backend/schema.ts` | 프로필 요청/응답 Zod 스키마 |
| Influencer Error | `src/features/onboarding/influencer/backend/error.ts` | Influencer 관련 에러 코드 |

### Frontend Modules
| 모듈 | 위치 | 설명 |
|------|------|------|
| Onboarding Page | `src/app/onboarding/influencer/page.tsx` | 인플루언서 온보딩 페이지 |
| Profile Form | `src/features/onboarding/influencer/components/profile-form.tsx` | 기본 정보 입력 폼 |
| SNS Channel Manager | `src/features/onboarding/influencer/components/sns-channel-manager.tsx` | SNS 채널 추가/삭제/수정 |
| Category Selector | `src/features/onboarding/influencer/components/category-selector.tsx` | 활동 카테고리 다중 선택 |
| useInfluencerOnboarding | `src/features/onboarding/influencer/hooks/useInfluencerOnboarding.ts` | 프로필 등록 mutation hook |

### Shared Modules
| 모듈 | 위치 | 설명 |
|------|------|------|
| SNS URL Validator | `src/lib/validators/sns-url.ts` | 플랫폼별 URL 형식 검증 |
| Age Validator | `src/lib/validators/age.ts` | 만 14세 이상 검증 |
| Phone Formatter | `src/lib/formatters/phone.ts` | 전화번호 하이픈 추가 |

---

## Diagram

```mermaid
graph TB
    A[onboarding/influencer/page.tsx] --> B[ProfileForm]
    B --> C[SNS Channel Manager]
    B --> D[Category Selector]
    B --> E[useInfluencerOnboarding Hook]
    E --> F[apiClient]

    F --> G[/api/influencer/profile]
    G --> H[Influencer Route]
    H --> I[Influencer Service]
    I --> J[influencer_profiles Table]
    I --> K[users Table - onboarding_completed]

    C --> L[SNS URL Validator]
    B --> M[Age Validator]
    B --> N[Phone Formatter]

    H --> O[Influencer Schema]

    style A fill:#e1f5ff
    style G fill:#fff4e1
    style I fill:#f0f0f0
```

---

## Implementation Plan

### 1. Backend - Schema

```typescript
// src/features/onboarding/influencer/backend/schema.ts
import { z } from 'zod';

const SNSChannelSchema = z.object({
  type: z.enum(['naver', 'youtube', 'instagram', 'threads']),
  channel_name: z.string().min(1, '채널명을 입력해주세요.'),
  url: z.string().url('유효한 URL을 입력해주세요.'),
});

export const InfluencerProfileRequestSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.').max(50),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다.'),
  birth_date: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear();
    return age >= 14;
  }, '만 14세 이상만 가입 가능합니다.'),
  sns_channels: z.array(SNSChannelSchema).min(1, 'SNS 채널을 최소 1개 등록해주세요.').max(4, 'SNS 채널은 최대 4개까지 등록 가능합니다.'),
  categories: z.array(z.string()).optional(),
});
```

**Unit Tests**:
- [ ] SNS 채널 최소 1개, 최대 4개 제한 테스트
- [ ] 만 14세 미만 검증 실패 테스트
- [ ] 전화번호 형식 검증 테스트
- [ ] SNS URL 형식 검증 테스트

---

### 2. Backend - Service

```typescript
// src/features/onboarding/influencer/backend/service.ts
export const createInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  request: InfluencerProfileRequest,
): Promise<HandlerResult<InfluencerProfileResponse, InfluencerServiceError, unknown>> => {
  // 1. URL 중복 체크
  const urls = request.sns_channels.map((ch) => ch.url);
  const { data: existingProfiles } = await client
    .from('influencer_profiles')
    .select('id')
    .or(urls.map((url) => `sns_channels.cs.{"url":"${url}"}`).join(','));

  if (existingProfiles && existingProfiles.length > 0) {
    return failure(400, influencerErrorCodes.duplicateSnsUrl, '이미 등록된 SNS URL입니다.');
  }

  // 2. 프로필 생성
  const { data, error } = await client
    .from('influencer_profiles')
    .insert({
      user_id: userId,
      name: request.name,
      phone: request.phone,
      birth_date: request.birth_date,
      sns_channels: request.sns_channels,
      categories: request.categories || [],
    })
    .select()
    .single();

  if (error || !data) {
    return failure(500, influencerErrorCodes.profileCreationFailed, '프로필 생성 실패');
  }

  // 3. users 테이블 onboarding_completed 업데이트
  await client
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  return success({
    profileId: data.id,
    userId: data.user_id,
    name: data.name,
  });
};
```

**Unit Tests**:
- [ ] URL 중복 시 실패 반환 테스트
- [ ] 프로필 생성 성공 테스트
- [ ] onboarding_completed 업데이트 테스트

---

### 3. Frontend - SNS Channel Manager

```typescript
// src/features/onboarding/influencer/components/sns-channel-manager.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

type SNSChannel = {
  type: 'naver' | 'youtube' | 'instagram' | 'threads';
  channel_name: string;
  url: string;
};

export const SNSChannelManager = ({ value, onChange }: { value: SNSChannel[]; onChange: (channels: SNSChannel[]) => void }) => {
  const [currentChannel, setCurrentChannel] = useState<SNSChannel>({
    type: 'naver',
    channel_name: '',
    url: '',
  });

  const addChannel = () => {
    if (value.length >= 4) {
      return; // 최대 4개
    }
    onChange([...value, currentChannel]);
    setCurrentChannel({ type: 'naver', channel_name: '', url: '' });
  };

  const removeChannel = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Select value={currentChannel.type} onValueChange={(type) => setCurrentChannel({ ...currentChannel, type })}>
          <option value="naver">네이버 블로그</option>
          <option value="youtube">유튜브</option>
          <option value="instagram">인스타그램</option>
          <option value="threads">스레드</option>
        </Select>
        <Input placeholder="채널명" value={currentChannel.channel_name} onChange={(e) => setCurrentChannel({ ...currentChannel, channel_name: e.target.value })} />
        <Input placeholder="URL" value={currentChannel.url} onChange={(e) => setCurrentChannel({ ...currentChannel, url: e.target.value })} />
      </div>
      <Button type="button" onClick={addChannel} disabled={value.length >= 4}>
        채널 추가 ({value.length}/4)
      </Button>

      <div className="space-y-2">
        {value.map((channel, index) => (
          <Card key={index} className="p-3 flex justify-between items-center">
            <div>
              <span className="font-semibold">{channel.type}</span> - {channel.channel_name}
            </div>
            <Button variant="destructive" size="sm" onClick={() => removeChannel(index)}>
              삭제
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

**QA Checklist**:
- [ ] 채널 추가 시 목록에 표시
- [ ] 최대 4개 제한 확인
- [ ] 채널 삭제 동작 확인
- [ ] 각 플랫폼 선택 가능 확인
- [ ] 입력값 초기화 확인

---

## Shadcn UI Components

```bash
npx shadcn@latest add select
npx shadcn@latest add badge
```

---

## Testing Checklist

### Backend
- [ ] SNS URL 중복 체크 로직 테스트
- [ ] 만 14세 미만 검증 테스트
- [ ] JSONB 배열 저장 테스트

### Frontend
- [ ] SNS 채널 추가/삭제 테스트
- [ ] 카테고리 다중 선택 테스트
- [ ] 폼 제출 및 온보딩 완료 테스트