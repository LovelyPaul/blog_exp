# UC-003 ~ UC-009 구현 계획 요약

각 유스케이스의 상세 구현 계획은 개별 plan.md 파일에 작성되어야 하나, 전체 구조 파악을 위한 요약 문서입니다.

---

## UC-003: 광고주 정보 등록

### 핵심 모듈
- **Backend**: `features/onboarding/advertiser/backend/` (route, service, schema, error)
- **Frontend**: `features/onboarding/advertiser/components/` (business-form, address-search)
- **Page**: `app/onboarding/advertiser/page.tsx`

### 주요 기능
1. 사업자등록번호 체크섬 검증
2. 사업자번호 중복 확인
3. Daum Postcode API 연동
4. Geocoding API로 좌표 추출
5. 비동기 국세청 API 검증 (선택)

### 테스트 포인트
- 사업자번호 10자리 검증
- 체크섬 알고리즘 테스트
- 주소 검색 및 좌표 추출
- 중복 사업자번호 처리

---

## UC-004: 홈 & 체험단 목록 탐색

### 핵심 모듈
- **Backend**: `features/campaigns/list/backend/` (route, service, schema)
- **Frontend**: `features/campaigns/list/components/` (campaign-card, filter-bar, search-bar, sort-dropdown)
- **Hooks**: `useCampaignList.ts` (무한 스크롤)
- **Page**: `app/page.tsx` or `app/campaigns/page.tsx`

### 주요 기능
1. 복합 필터링 (카테고리 + 지역 + 검색)
2. 정렬 (최신순, 마감임박순, 인기순)
3. 디바운싱 검색 (300ms)
4. 무한 스크롤 (Intersection Observer, 20개씩)
5. URL 쿼리 파라미터 동기화

### 쿼리 최적화
```typescript
// 복합 인덱스 활용
const { data } = await client
  .from('campaigns')
  .select('*, advertiser_profiles(business_name, business_category)')
  .eq('status', 'recruiting')
  .gte('end_date', new Date().toISOString())
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

### 테스트 포인트
- 필터 조합 테스트 (category + region + search)
- 정렬 옵션별 결과 확인
- 무한 스크롤 동작
- URL 쿼리 파라미터 동기화

---

## UC-005: 체험단 상세

### 핵심 모듈
- **Backend**: `features/campaigns/detail/backend/` (route, service)
- **Frontend**: `features/campaigns/detail/components/` (campaign-header, campaign-info, store-info, image-gallery, apply-button)
- **Page**: `app/campaigns/[id]/page.tsx`

### 주요 기능
1. HTML 콘텐츠 sanitize (DOMPurify)
2. 지도 API 연동 (Kakao/Naver Map)
3. 지원 가능 여부 판단
4. 조회수 비동기 증가
5. SSR 최적화 (SEO)

### 지원 가능 조건
```typescript
const canApply =
  isAuthenticated &&
  user.role === 'influencer' &&
  campaign.status === 'recruiting' &&
  new Date(campaign.end_date) >= new Date() &&
  campaign.applicants_count < campaign.max_applicants &&
  !hasAlreadyApplied;
```

### 테스트 포인트
- HTML sanitize 처리
- 지도 표시 (좌표 있는 경우)
- 지원 버튼 조건부 렌더링
- 조회수 증가 확인

---

## UC-006: 체험단 지원

### 핵심 모듈
- **Backend**: `features/applications/apply/backend/` (route, service - 트랜잭션 처리)
- **Frontend**: `features/applications/apply/components/` (apply-form, sns-channel-select, date-picker)
- **Page**: `app/campaigns/[id]/apply/page.tsx`

### 주요 기능
1. 트랜잭션으로 INSERT + UPDATE 원자성 보장
2. 동시성 제어 (FOR UPDATE)
3. 중복 지원 방지
4. 모집 인원 초과 확인
5. 비동기 알림 큐잉 (광고주에게)

### 트랜잭션 로직
```typescript
// Supabase RPC 함수 사용
await client.rpc('apply_to_campaign', {
  p_campaign_id: campaignId,
  p_influencer_id: userId,
  p_message: message,
  p_visit_date: visitDate,
  p_selected_sns_channel: snsChannel,
});
```

### 테스트 포인트
- 중복 지원 차단
- 동시 지원 시 모집 인원 초과 방지
- 트랜잭션 롤백 처리
- 지원 성공 시 리다이렉트

---

## UC-007: 내 지원 목록

### 핵심 모듈
- **Backend**: `features/applications/my-applications/backend/` (route, service)
- **Frontend**: `features/applications/my-applications/components/` (application-card, status-tabs, application-detail-modal)
- **Page**: `app/my/applications/page.tsx`

### 주요 기능
1. 상태별 필터링 (pending, selected, rejected)
2. URL 쿼리 파라미터 동기화
3. 삭제된 체험단 처리 (회색 표시)
4. 무한 스크롤

### JOIN 쿼리
```typescript
const { data } = await client
  .from('applications')
  .select(`
    *,
    campaigns(*),
    campaigns.advertiser_profiles(business_name, business_category)
  `)
  .eq('influencer_id', userId)
  .is('deleted_at', null)
  .order('created_at', { ascending: false });
```

### 테스트 포인트
- 상태별 탭 전환
- 삭제된 체험단 표시
- 지원 상세 모달 표시

---

## UC-008: 광고주 체험단 관리

### 핵심 모듈
- **Backend**: `features/advertiser/campaigns/backend/` (route, service - CRUD)
- **Frontend**: `features/advertiser/campaigns/components/` (campaign-list, campaign-card, campaign-form, status-tabs)
- **Page**: `app/advertiser/campaigns/page.tsx`

### 주요 기능
1. 본인 체험단만 조회 (advertiser_id = user_id)
2. Soft delete (deleted_at)
3. 상태 자동 업데이트 (end_date 기준)
4. 지원자 있는 체험단 삭제 시 경고
5. 체험단 등록/수정/삭제

### 상태 자동 업데이트
```typescript
// Batch job or 조회 시 처리
await client
  .from('campaigns')
  .update({ status: 'ended' })
  .lt('end_date', new Date().toISOString())
  .eq('status', 'recruiting');
```

### 테스트 포인트
- 본인 체험단만 조회
- Soft delete 동작
- 지원자 있는 경우 삭제 경고
- 체험단 수정 (모집중인 경우만)

---

## UC-009: 광고주 체험단 상세 & 모집 관리

### 핵심 모듈
- **Backend**: `features/advertiser/applicants/backend/` (route, service - 상태 변경)
- **Frontend**: `features/advertiser/applicants/components/` (applicant-list, applicant-card, applicant-detail-modal, status-tabs)
- **Page**: `app/advertiser/campaigns/[id]/page.tsx`

### 주요 기능
1. 지원자 상태 변경 (pending → selected/rejected)
2. 피드백 메시지 저장
3. 선정 인원 초과 경고
4. 비동기 알림 큐잉 (인플루언서에게)
5. 낙관적 업데이트 (Optimistic Update)

### 상태 변경 API
```typescript
// PATCH /advertiser/campaigns/:campaignId/applications/:applicationId
await client
  .from('applications')
  .update({
    status: newStatus,
    feedback: feedback || null,
    updated_at: new Date().toISOString(),
  })
  .eq('id', applicationId)
  .eq('campaign_id', campaignId); // 권한 체크
```

### 테스트 포인트
- 지원자 선정/탈락 처리
- 피드백 메시지 저장
- 선정 인원 초과 시 경고
- 낙관적 업데이트 동작

---

## 공통 패턴 및 컨벤션

### 1. Backend Service 패턴

```typescript
export const serviceFunction = async (
  client: SupabaseClient,
  params: ParamsType,
): Promise<HandlerResult<SuccessType, ErrorType, unknown>> => {
  // 1. 입력 검증
  // 2. 권한 확인
  // 3. 비즈니스 로직 수행
  // 4. 데이터베이스 조작
  // 5. 응답 반환 (success 또는 failure)
};
```

### 2. Frontend Hook 패턴

```typescript
export const useFeature = () => {
  return useQuery({
    queryKey: ['feature', params],
    queryFn: () => fetchFunction(params),
    enabled: Boolean(condition),
    staleTime: 60 * 1000, // 1분
  });
};

export const useFeatureMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mutateFunction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature'] });
    },
  });
};
```

### 3. Component 패턴

```typescript
'use client';

export const FeatureComponent = ({ prop }: FeatureComponentProps) => {
  // 1. Hooks
  const { data, isLoading } = useFeature();

  // 2. Event Handlers
  const handleAction = () => {
    // ...
  };

  // 3. Render
  if (isLoading) return <Skeleton />;
  if (!data) return <EmptyState />;

  return <div>{/* Component JSX */}</div>;
};
```

---

## 전체 구현 순서

### Phase 1: 기반 인프라 (1-2주)
1. Auth 시스템 (UC-001)
2. 인플루언서 온보딩 (UC-002)
3. 광고주 온보딩 (UC-003)

### Phase 2: 공개 페이지 (1-2주)
1. 체험단 목록 (UC-004)
2. 체험단 상세 (UC-005)

### Phase 3: 지원 플로우 (1주)
1. 체험단 지원 (UC-006)
2. 내 지원 목록 (UC-007)

### Phase 4: 광고주 대시보드 (1-2주)
1. 광고주 체험단 관리 (UC-008)
2. 지원자 관리 (UC-009)

---

## 참고 자료

- [Master Implementation Plan](./IMPLEMENTATION_MASTER_PLAN.md)
- [UC-001 Detailed Plan](./001/plan.md)
- [UC-002 Detailed Plan](./002/plan.md)
- [Database Schema](./database.md)
- [User Flows](./userflow.md)