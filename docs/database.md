# 블로그 체험단 SaaS — 데이터베이스 설계

본 문서는 블로그 체험단 플랫폼 SaaS의 데이터베이스 설계를 정의합니다.
유저플로우를 기반으로 최소 스펙의 PostgreSQL 스키마를 구성하였습니다.

---

## 목차
1. [개요](#1-개요)
2. [데이터플로우](#2-데이터플로우)
3. [ERD (Entity Relationship Diagram)](#3-erd-entity-relationship-diagram)
4. [테이블 스키마](#4-테이블-스키마)
5. [JSONB 필드 구조](#5-jsonb-필드-구조)
6. [제약 조건 및 정책](#6-제약-조건-및-정책)
7. [주요 쿼리 패턴](#7-주요-쿼리-패턴)
8. [Row Level Security (RLS)](#8-row-level-security-rls)
9. [인덱싱 전략](#9-인덱싱-전략)
10. [마이그레이션 가이드](#10-마이그레이션-가이드)

---

## 1. 개요

### 1.1 기술 스택
- **Database**: PostgreSQL 14+ (Supabase)
- **ORM**: Supabase Client (JavaScript/TypeScript)
- **Authentication**: Supabase Auth

### 1.2 설계 원칙
- ✅ 유저플로우 기반 최소 스펙
- ✅ 정규화 (3NF) 준수
- ✅ JSONB 활용으로 유연성 확보
- ✅ 인덱싱을 통한 성능 최적화
- ✅ RLS를 통한 보안 강화
- ✅ Soft Delete 지원

### 1.3 테이블 목록
| 테이블명 | 목적 | 주요 관계 |
|---------|------|----------|
| `users` | 사용자 인증 및 역할 관리 | 1:1 profiles |
| `user_agreements` | 약관 동의 이력 | N:1 users |
| `influencer_profiles` | 인플루언서 프로필 | 1:1 users, 1:N applications |
| `advertiser_profiles` | 광고주 프로필 | 1:1 users, 1:N campaigns |
| `campaigns` | 체험단 정보 | N:1 advertiser, 1:N applications |
| `applications` | 지원 내역 | N:1 campaign, N:1 influencer |

---

## 2. 데이터플로우

### 2.1 회원가입 플로우
```
[사용자 입력]
   ↓
users 테이블 생성 (email, role)
   ↓
user_agreements 테이블 생성 (약관 동의)
   ↓
역할별 분기
   ├─ role='influencer' → influencer_profiles 생성
   └─ role='advertiser' → advertiser_profiles 생성
```

### 2.2 체험단 등록 플로우
```
[광고주 입력]
   ↓
campaigns 테이블 INSERT
   - advertiser_id (FK)
   - title, category, dates, max_applicants
   - benefits, missions
   - store_info (JSONB)
   - thumbnail_url, additional_images (JSONB)
   - status = 'recruiting'
```

### 2.3 체험단 지원 플로우
```
[인플루언서 입력]
   ↓
중복 지원 체크 (applications)
   ↓
applications 테이블 INSERT
   - campaign_id (FK)
   - influencer_id (FK)
   - message, visit_date
   - selected_sns_channel (JSONB)
   - status = 'pending'
   ↓
campaigns.applicants_count 증가 (트리거 또는 애플리케이션 레벨)
```

### 2.4 체험단 선정 플로우
```
[광고주 선택]
   ↓
트랜잭션 시작
   ├─ applications UPDATE (선택된 지원자)
   │    SET status = 'selected'
   ├─ applications UPDATE (선택 안 된 지원자)
   │    SET status = 'rejected'
   └─ campaigns UPDATE
        SET status = 'completed'
트랜잭션 커밋
   ↓
선정/반려 알림 발송 (애플리케이션 레벨)
```

### 2.5 전체 데이터플로우 다이어그램
```
┌─────────────────────────────────────────────────────────────┐
│                     users (인증 계정)                         │
│  id, email, role, onboarding_completed                       │
└────────┬──────────────────────────────────┬─────────────────┘
         │                                  │
         │ 1:1                              │ 1:1
         ↓                                  ↓
┌─────────────────────┐          ┌─────────────────────────┐
│ influencer_profiles │          │  advertiser_profiles    │
│ name, phone         │          │  business_name, address │
│ birth_date          │          │  business_number        │
│ sns_channels (JSONB)│          └──────────┬──────────────┘
└──────────┬──────────┘                     │
           │                                │ 1:N
           │ 1:N                            ↓
           │                       ┌─────────────────────┐
           │                       │     campaigns       │
           │                       │  title, category    │
           │                       │  dates, status      │
           │                       │  store_info (JSONB) │
           │                       └──────────┬──────────┘
           │                                  │
           │                                  │ 1:N
           │                                  ↓
           │                       ┌─────────────────────┐
           └──────────────────────→│    applications     │
                  N:1              │  message, visit_date│
                                   │  status             │
                                   └─────────────────────┘

┌─────────────────────┐
│  user_agreements    │  ← N:1 users
│  agreement_type     │
│  agreement_version  │
└─────────────────────┘
```

---

## 3. ERD (Entity Relationship Diagram)

### 3.1 관계 요약
```
users (1) ──────── (1) influencer_profiles
users (1) ──────── (1) advertiser_profiles
users (1) ──────── (N) user_agreements
users (1) ──────── (N) applications (as influencer)
users (1) ──────── (N) campaigns (as advertiser)
campaigns (1) ──── (N) applications
```

### 3.2 Cardinality
- `users` : `influencer_profiles` = 1 : 0..1
- `users` : `advertiser_profiles` = 1 : 0..1
- `users` : `user_agreements` = 1 : N
- `users` : `applications` = 1 : N (인플루언서)
- `users` : `campaigns` = 1 : N (광고주)
- `campaigns` : `applications` = 1 : N

---

## 4. 테이블 스키마

### 4.1 users (사용자 인증 테이블)

**목적**: Supabase Auth와 연동하여 사용자 인증 및 역할 관리

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Auth 정보 (Supabase Auth와 연동)
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('influencer', 'advertiser')),

  -- 온보딩 상태
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,

  -- 계정 상태
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 코멘트
COMMENT ON TABLE users IS '사용자 인증 및 역할 관리 테이블';
COMMENT ON COLUMN users.role IS '사용자 역할: influencer(인플루언서) 또는 advertiser(광고주)';
COMMENT ON COLUMN users.onboarding_completed IS '온보딩 완료 여부 (역할별 프로필 정보 입력 완료)';
```

**주요 필드**:
- `id`: UUID, 기본키
- `email`: 이메일 (Supabase Auth와 동기화)
- `role`: 역할 (influencer/advertiser)
- `onboarding_completed`: 온보딩 완료 여부

**관계**:
- 1:1 → `influencer_profiles` (role='influencer')
- 1:1 → `advertiser_profiles` (role='advertiser')
- 1:N → `user_agreements`
- 1:N → `applications` (influencer)
- 1:N → `campaigns` (advertiser)

---

### 4.2 user_agreements (약관 동의 이력)

**목적**: 사용자의 약관 동의 내역 저장 (법적 요구사항)

```sql
CREATE TABLE user_agreements (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 약관 정보
  agreement_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'marketing' 등
  agreement_version VARCHAR(20) NOT NULL, -- '1.0', '2.0' 등
  is_agreed BOOLEAN NOT NULL,

  -- 타임스탬프
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX idx_user_agreements_user_id ON user_agreements(user_id);
CREATE INDEX idx_user_agreements_type ON user_agreements(agreement_type);

-- 코멘트
COMMENT ON TABLE user_agreements IS '사용자 약관 동의 이력';
COMMENT ON COLUMN user_agreements.agreement_type IS '약관 유형: terms(이용약관), privacy(개인정보), marketing(마케팅)';
```

**주요 필드**:
- `user_id`: FK → users.id
- `agreement_type`: 약관 유형
- `agreement_version`: 약관 버전
- `is_agreed`: 동의 여부

---

### 4.3 influencer_profiles (인플루언서 프로필)

**목적**: 인플루언서의 기본 정보 및 SNS 채널 정보

```sql
CREATE TABLE influencer_profiles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  birth_date DATE NOT NULL,

  -- SNS 채널 (JSONB 배열)
  -- 예: [{"type":"naver","channel_name":"myBlog","url":"https://..."},...]
  sns_channels JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 활동 카테고리 (선택)
  categories TEXT[],

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX idx_influencer_profiles_user_id ON influencer_profiles(user_id);
CREATE INDEX idx_influencer_profiles_sns_channels ON influencer_profiles USING GIN(sns_channels);

-- 제약 조건
ALTER TABLE influencer_profiles
  ADD CONSTRAINT check_birth_date_valid
  CHECK (birth_date <= CURRENT_DATE - INTERVAL '14 years'); -- 만 14세 이상

-- 코멘트
COMMENT ON TABLE influencer_profiles IS '인플루언서 프로필 정보';
COMMENT ON COLUMN influencer_profiles.sns_channels IS 'SNS 채널 정보 (JSONB 배열)';
COMMENT ON COLUMN influencer_profiles.categories IS '주요 활동 카테고리 (음식/뷰티/패션 등)';
```

**주요 필드**:
- `user_id`: FK → users.id (UNIQUE)
- `name`, `phone`, `birth_date`: 기본 정보
- `sns_channels`: JSONB 배열 (채널 정보)
- `categories`: 활동 카테고리 (TEXT[])

**JSONB 구조 예시**:
```json
[
  {
    "type": "naver",
    "channel_name": "myBlog",
    "url": "https://blog.naver.com/myBlog"
  },
  {
    "type": "youtube",
    "channel_name": "MyChannel",
    "url": "https://youtube.com/@MyChannel"
  }
]
```

---

### 4.4 advertiser_profiles (광고주 프로필)

**목적**: 광고주의 사업자 정보 및 매장 정보

```sql
CREATE TABLE advertiser_profiles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 기본 정보
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  -- 사업자 정보
  business_name VARCHAR(200) NOT NULL,
  business_number VARCHAR(12) UNIQUE NOT NULL, -- 하이픈 제거한 10자리
  business_category VARCHAR(100) NOT NULL,
  representative_name VARCHAR(100),

  -- 주소 정보
  address VARCHAR(500) NOT NULL,
  address_detail VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- 검증 상태 (선택)
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'failed'

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 인덱스
CREATE INDEX idx_advertiser_profiles_user_id ON advertiser_profiles(user_id);
CREATE INDEX idx_advertiser_profiles_business_number ON advertiser_profiles(business_number);
CREATE INDEX idx_advertiser_profiles_location ON advertiser_profiles(latitude, longitude);

-- 코멘트
COMMENT ON TABLE advertiser_profiles IS '광고주 프로필 및 사업자 정보';
COMMENT ON COLUMN advertiser_profiles.business_number IS '사업자등록번호 (하이픈 제거, 10자리)';
COMMENT ON COLUMN advertiser_profiles.verification_status IS '사업자번호 검증 상태';
```

**주요 필드**:
- `user_id`: FK → users.id (UNIQUE)
- `business_name`, `business_number`: 사업자 정보
- `address`, `latitude`, `longitude`: 위치 정보
- `verification_status`: 검증 상태

---

### 4.5 campaigns (체험단)

**목적**: 체험단 모집 정보 및 매장 상세 정보

```sql
CREATE TABLE campaigns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 기본 정보
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- '음식점', '카페', '뷰티', '패션' 등

  -- 이미지
  thumbnail_url TEXT NOT NULL,
  additional_images JSONB DEFAULT '[]'::jsonb, -- URL 배열

  -- 모집 정보
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_applicants INTEGER NOT NULL CHECK (max_applicants > 0),

  -- 콘텐츠 (리치 텍스트)
  benefits TEXT NOT NULL, -- 제공 혜택
  missions TEXT NOT NULL, -- 미션
  notes TEXT, -- 유의사항

  -- 매장 정보 (JSONB)
  -- {"store_name":"...", "address":"...", "phone":"...", "hours":"...", "latitude":..., "longitude":...}
  store_info JSONB NOT NULL,

  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting'
    CHECK (status IN ('recruiting', 'ended', 'completed', 'closed')),

  -- 통계
  applicants_count INTEGER DEFAULT 0 NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX idx_campaigns_deleted_at ON campaigns(deleted_at) WHERE deleted_at IS NULL;

-- 모집 중 체험단 조회용 복합 인덱스
CREATE INDEX idx_campaigns_recruiting ON campaigns(status, end_date, created_at DESC)
  WHERE deleted_at IS NULL;

-- 제약 조건
ALTER TABLE campaigns
  ADD CONSTRAINT check_dates_valid CHECK (end_date >= start_date);

-- 코멘트
COMMENT ON TABLE campaigns IS '체험단 정보';
COMMENT ON COLUMN campaigns.status IS '상태: recruiting(모집중), ended(모집종료), completed(선정완료), closed(종료)';
COMMENT ON COLUMN campaigns.store_info IS '매장 상세 정보 (JSONB)';
```

**주요 필드**:
- `advertiser_id`: FK → users.id
- `title`, `category`: 기본 정보
- `start_date`, `end_date`, `max_applicants`: 모집 정보
- `benefits`, `missions`, `notes`: 콘텐츠
- `store_info`: JSONB (매장 정보)
- `status`: 상태 (recruiting/ended/completed/closed)
- `applicants_count`: 지원자 수

**상태 전이**:
```
recruiting → ended → completed → closed
```

---

### 4.6 applications (지원 내역)

**목적**: 인플루언서의 체험단 지원 및 선정 상태

```sql
CREATE TABLE applications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 지원 정보
  message TEXT NOT NULL, -- 각오 한마디 (최대 500자)
  visit_date DATE NOT NULL, -- 방문 예정일
  selected_sns_channel JSONB NOT NULL, -- 선택한 SNS 채널 정보

  -- 상태
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'selected', 'rejected')),

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- 중복 지원 방지 (rejected 제외)
  CONSTRAINT unique_application_per_campaign
    UNIQUE NULLS NOT DISTINCT (campaign_id, influencer_id,
      CASE WHEN status != 'rejected' THEN status END)
);

-- 인덱스
CREATE INDEX idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- 지원자 조회용 복합 인덱스
CREATE INDEX idx_applications_campaign_status ON applications(campaign_id, status, created_at DESC);
CREATE INDEX idx_applications_influencer_status ON applications(influencer_id, status, created_at DESC);

-- 코멘트
COMMENT ON TABLE applications IS '체험단 지원 내역';
COMMENT ON COLUMN applications.message IS '각오 한마디 (최대 500자)';
COMMENT ON COLUMN applications.visit_date IS '방문 예정일';
COMMENT ON COLUMN applications.status IS '상태: pending(대기), selected(선정), rejected(반려)';
COMMENT ON COLUMN applications.selected_sns_channel IS '지원 시 선택한 SNS 채널';
```

**주요 필드**:
- `campaign_id`: FK → campaigns.id
- `influencer_id`: FK → users.id
- `message`: 각오 한마디
- `visit_date`: 방문 예정일
- `selected_sns_channel`: JSONB (선택한 채널)
- `status`: 상태 (pending/selected/rejected)

**상태 전이**:
```
pending → selected (선정)
pending → rejected (반려)
```

---

## 5. JSONB 필드 구조

### 5.1 influencer_profiles.sns_channels

**구조**: JSONB 배열 (Array of Objects)

```json
[
  {
    "type": "naver",
    "channel_name": "myBlog",
    "url": "https://blog.naver.com/myBlog"
  },
  {
    "type": "youtube",
    "channel_name": "MyChannel",
    "url": "https://youtube.com/@MyChannel"
  },
  {
    "type": "instagram",
    "channel_name": "my_insta",
    "url": "https://instagram.com/my_insta"
  },
  {
    "type": "threads",
    "channel_name": "my_threads",
    "url": "https://threads.net/@my_threads"
  }
]
```

**필드**:
- `type`: 채널 유형 (naver/youtube/instagram/threads)
- `channel_name`: 채널명
- `url`: 채널 URL

**쿼리 예시**:
```sql
-- SNS 채널에서 특정 유형 필터링
SELECT * FROM influencer_profiles
WHERE sns_channels @> '[{"type": "youtube"}]';

-- 채널 개수 조회
SELECT
  name,
  jsonb_array_length(sns_channels) as channel_count
FROM influencer_profiles;
```

---

### 5.2 campaigns.store_info

**구조**: JSONB 객체

```json
{
  "store_name": "맛있는 카페",
  "address": "서울시 강남구 테헤란로 123",
  "address_detail": "3층",
  "phone": "02-1234-5678",
  "hours": "매일 10:00 - 22:00",
  "latitude": 37.5012345,
  "longitude": 127.0398765
}
```

**필드**:
- `store_name`: 매장명
- `address`: 주소
- `address_detail`: 상세주소
- `phone`: 연락처
- `hours`: 영업시간
- `latitude`, `longitude`: 좌표

**쿼리 예시**:
```sql
-- 매장명 검색
SELECT * FROM campaigns
WHERE store_info->>'store_name' ILIKE '%카페%';

-- 위치 기반 검색 (일정 범위 내)
SELECT * FROM campaigns
WHERE (store_info->>'latitude')::decimal BETWEEN 37.4 AND 37.6
  AND (store_info->>'longitude')::decimal BETWEEN 126.9 AND 127.1;
```

---

### 5.3 campaigns.additional_images

**구조**: JSONB 배열 (Array of Strings)

```json
[
  "https://storage.example.com/campaigns/abc123/image1.jpg",
  "https://storage.example.com/campaigns/abc123/image2.jpg",
  "https://storage.example.com/campaigns/abc123/image3.jpg"
]
```

**쿼리 예시**:
```sql
-- 추가 이미지 개수
SELECT
  title,
  jsonb_array_length(additional_images) as image_count
FROM campaigns;

-- 첫 번째 추가 이미지
SELECT
  title,
  additional_images->0 as first_image
FROM campaigns;
```

---

### 5.4 applications.selected_sns_channel

**구조**: JSONB 객체

```json
{
  "type": "naver",
  "channel_name": "myBlog",
  "url": "https://blog.naver.com/myBlog"
}
```

**필드**:
- `type`: 채널 유형
- `channel_name`: 채널명
- `url`: 채널 URL

**쿼리 예시**:
```sql
-- 네이버 블로그로 지원한 내역
SELECT * FROM applications
WHERE selected_sns_channel->>'type' = 'naver';
```

---

## 6. 제약 조건 및 정책

### 6.1 Primary Keys
- 모든 테이블: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`

### 6.2 Foreign Keys (ON DELETE CASCADE)
```sql
-- influencer_profiles
user_id → users(id) ON DELETE CASCADE

-- advertiser_profiles
user_id → users(id) ON DELETE CASCADE

-- user_agreements
user_id → users(id) ON DELETE CASCADE

-- campaigns
advertiser_id → users(id) ON DELETE CASCADE

-- applications
campaign_id → campaigns(id) ON DELETE CASCADE
influencer_id → users(id) ON DELETE CASCADE
```

### 6.3 UNIQUE 제약
```sql
-- users
email UNIQUE

-- influencer_profiles
user_id UNIQUE

-- advertiser_profiles
user_id UNIQUE
business_number UNIQUE

-- applications (부분 UNIQUE - rejected 제외)
CONSTRAINT unique_application_per_campaign
```

### 6.4 CHECK 제약
```sql
-- users
role IN ('influencer', 'advertiser')

-- campaigns
max_applicants > 0
status IN ('recruiting', 'ended', 'completed', 'closed')
end_date >= start_date

-- applications
status IN ('pending', 'selected', 'rejected')

-- influencer_profiles
birth_date <= CURRENT_DATE - INTERVAL '14 years' -- 만 14세 이상
```

### 6.5 Soft Delete
```sql
-- users
deleted_at TIMESTAMP WITH TIME ZONE

-- campaigns
deleted_at TIMESTAMP WITH TIME ZONE
```

---

## 7. 주요 쿼리 패턴

### 7.1 홈 - 모집 중 체험단 목록

```sql
-- 기본 조회 (페이지네이션)
SELECT
  c.id,
  c.title,
  c.thumbnail_url,
  c.category,
  c.end_date,
  c.max_applicants,
  c.applicants_count,
  c.store_info->>'address' as location,
  ap.business_name as advertiser_name,
  -- D-day 계산
  c.end_date - CURRENT_DATE as days_left
FROM campaigns c
JOIN advertiser_profiles ap ON c.advertiser_id = ap.user_id
WHERE c.status = 'recruiting'
  AND c.end_date >= CURRENT_DATE
  AND c.deleted_at IS NULL
ORDER BY c.created_at DESC
LIMIT 20 OFFSET 0;
```

### 7.2 체험단 상세 조회

```sql
-- 단건 조회 (조회수 증가 포함)
SELECT
  c.*,
  ap.business_name,
  ap.phone as advertiser_phone,
  -- 현재 사용자의 지원 여부 (파라미터 바인딩)
  EXISTS(
    SELECT 1 FROM applications
    WHERE campaign_id = c.id
      AND influencer_id = $1
      AND status != 'rejected'
  ) as has_applied
FROM campaigns c
JOIN advertiser_profiles ap ON c.advertiser_id = ap.user_id
WHERE c.id = $2
  AND c.deleted_at IS NULL;

-- 조회수 증가 (별도 쿼리 또는 트리거)
UPDATE campaigns
SET view_count = view_count + 1
WHERE id = $1;
```

### 7.3 체험단 지원 - 중복 체크

```sql
-- 중복 지원 확인
SELECT id FROM applications
WHERE campaign_id = $1
  AND influencer_id = $2
  AND status != 'rejected';

-- 지원 INSERT
INSERT INTO applications (
  campaign_id,
  influencer_id,
  message,
  visit_date,
  selected_sns_channel
) VALUES ($1, $2, $3, $4, $5)
RETURNING *;
```

### 7.4 내 지원 목록 (인플루언서)

```sql
SELECT
  a.id,
  a.message,
  a.visit_date,
  a.status,
  a.created_at,
  c.title as campaign_title,
  c.thumbnail_url,
  c.category,
  c.end_date,
  ap.business_name,
  -- D-day 계산
  c.end_date - CURRENT_DATE as days_left
FROM applications a
JOIN campaigns c ON a.campaign_id = c.id
JOIN advertiser_profiles ap ON c.advertiser_id = ap.user_id
WHERE a.influencer_id = $1
  AND ($2::text IS NULL OR a.status = $2) -- 상태 필터 (선택)
  AND ($3::text IS NULL OR c.title ILIKE '%' || $3 || '%') -- 검색 (선택)
ORDER BY a.created_at DESC
LIMIT 20 OFFSET 0;
```

### 7.5 광고주 - 체험단 목록

```sql
SELECT
  c.id,
  c.title,
  c.thumbnail_url,
  c.category,
  c.status,
  c.start_date,
  c.end_date,
  c.max_applicants,
  c.applicants_count,
  c.created_at
FROM campaigns c
WHERE c.advertiser_id = $1
  AND c.deleted_at IS NULL
  AND ($2::text IS NULL OR c.status = $2) -- 상태 필터
ORDER BY c.created_at DESC
LIMIT 20 OFFSET 0;
```

### 7.6 광고주 - 지원자 목록

```sql
SELECT
  a.id,
  a.message,
  a.visit_date,
  a.status,
  a.created_at,
  a.selected_sns_channel,
  ip.name as influencer_name,
  ip.sns_channels,
  u.email as influencer_email
FROM applications a
JOIN influencer_profiles ip ON a.influencer_id = ip.user_id
JOIN users u ON ip.user_id = u.id
WHERE a.campaign_id = $1
  AND ($2::text IS NULL OR a.status = $2) -- 상태 필터
ORDER BY a.created_at DESC;
```

### 7.7 체험단 선정 처리 (트랜잭션)

```sql
BEGIN;

-- 선정된 지원자
UPDATE applications
SET status = 'selected', updated_at = NOW()
WHERE id = ANY($1::uuid[]); -- 선택된 지원자 ID 배열

-- 반려된 지원자
UPDATE applications
SET status = 'rejected', updated_at = NOW()
WHERE campaign_id = $2
  AND status = 'pending';

-- 체험단 상태 변경
UPDATE campaigns
SET status = 'completed', updated_at = NOW()
WHERE id = $2;

COMMIT;
```

### 7.8 통계 쿼리

```sql
-- 광고주 대시보드 통계
SELECT
  COUNT(*) as total_campaigns,
  COUNT(*) FILTER (WHERE status IN ('recruiting', 'ended')) as active_campaigns,
  SUM(applicants_count) as total_applicants
FROM campaigns
WHERE advertiser_id = $1
  AND deleted_at IS NULL;

-- 인플루언서 대시보드 통계
SELECT
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'selected') as selected,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM applications
WHERE influencer_id = $1;
```

---

## 8. Row Level Security (RLS)

### 8.1 RLS 활성화

```sql
-- 각 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
```

### 8.2 campaigns 정책

```sql
-- 모집 중 체험단은 누구나 조회 가능
CREATE POLICY "Anyone can view recruiting campaigns"
ON campaigns FOR SELECT
USING (
  status = 'recruiting'
  AND end_date >= CURRENT_DATE
  AND deleted_at IS NULL
);

-- 광고주는 자신의 체험단만 조회 가능 (모든 상태)
CREATE POLICY "Advertisers can view own campaigns"
ON campaigns FOR SELECT
USING (advertiser_id = auth.uid());

-- 광고주만 체험단 생성 가능
CREATE POLICY "Advertisers can insert campaigns"
ON campaigns FOR INSERT
WITH CHECK (
  advertiser_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'advertiser'
      AND onboarding_completed = true
  )
);

-- 광고주는 자신의 체험단만 수정 가능
CREATE POLICY "Advertisers can update own campaigns"
ON campaigns FOR UPDATE
USING (advertiser_id = auth.uid());

-- 광고주는 자신의 체험단만 삭제 가능
CREATE POLICY "Advertisers can delete own campaigns"
ON campaigns FOR DELETE
USING (advertiser_id = auth.uid());
```

### 8.3 applications 정책

```sql
-- 인플루언서는 자신의 지원 내역만 조회 가능
CREATE POLICY "Influencers can view own applications"
ON applications FOR SELECT
USING (influencer_id = auth.uid());

-- 광고주는 자신의 체험단 지원 내역 조회 가능
CREATE POLICY "Advertisers can view applications for own campaigns"
ON applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = applications.campaign_id
      AND campaigns.advertiser_id = auth.uid()
  )
);

-- 인플루언서만 지원 가능
CREATE POLICY "Influencers can insert applications"
ON applications FOR INSERT
WITH CHECK (
  influencer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'influencer'
      AND onboarding_completed = true
  )
);

-- 광고주는 자신의 체험단 지원 내역 수정 가능 (선정 프로세스)
CREATE POLICY "Advertisers can update applications for own campaigns"
ON applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = applications.campaign_id
      AND campaigns.advertiser_id = auth.uid()
  )
);
```

### 8.4 profiles 정책

```sql
-- 인플루언서는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Influencers can manage own profile"
ON influencer_profiles FOR ALL
USING (user_id = auth.uid());

-- 광고주는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Advertisers can manage own profile"
ON advertiser_profiles FOR ALL
USING (user_id = auth.uid());

-- 광고주는 지원자의 프로필 조회 가능
CREATE POLICY "Advertisers can view influencer profiles of applicants"
ON influencer_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN campaigns c ON a.campaign_id = c.id
    WHERE a.influencer_id = influencer_profiles.user_id
      AND c.advertiser_id = auth.uid()
  )
);
```

---

## 9. 인덱싱 전략

### 9.1 인덱스 목록

| 테이블 | 인덱스명 | 컬럼 | 유형 | 목적 |
|--------|----------|------|------|------|
| users | idx_users_email | email | B-tree | 로그인 조회 |
| users | idx_users_role | role | B-tree | 역할별 필터링 |
| users | idx_users_created_at | created_at DESC | B-tree | 가입 순 정렬 |
| campaigns | idx_campaigns_advertiser_id | advertiser_id | B-tree | 광고주별 조회 |
| campaigns | idx_campaigns_status | status | B-tree | 상태별 필터링 |
| campaigns | idx_campaigns_end_date | end_date | B-tree | 마감일 정렬 |
| campaigns | idx_campaigns_category | category | B-tree | 카테고리 필터링 |
| campaigns | idx_campaigns_recruiting | status, end_date, created_at | B-tree (복합) | 모집 중 체험단 조회 |
| applications | idx_applications_campaign_id | campaign_id | B-tree | 체험단별 지원자 조회 |
| applications | idx_applications_influencer_id | influencer_id | B-tree | 인플루언서별 지원 조회 |
| applications | idx_applications_status | status | B-tree | 상태별 필터링 |
| applications | idx_applications_campaign_status | campaign_id, status, created_at | B-tree (복합) | 지원자 목록 조회 |
| influencer_profiles | idx_influencer_profiles_sns_channels | sns_channels | GIN | JSONB 검색 |
| advertiser_profiles | idx_advertiser_profiles_location | latitude, longitude | B-tree (복합) | 위치 기반 검색 |

### 9.2 인덱스 사용 예시

```sql
-- idx_campaigns_recruiting 사용
EXPLAIN ANALYZE
SELECT * FROM campaigns
WHERE status = 'recruiting'
  AND end_date >= CURRENT_DATE
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- idx_applications_campaign_status 사용
EXPLAIN ANALYZE
SELECT * FROM applications
WHERE campaign_id = 'uuid-value'
  AND status = 'pending'
ORDER BY created_at DESC;

-- GIN 인덱스 사용 (JSONB 검색)
EXPLAIN ANALYZE
SELECT * FROM influencer_profiles
WHERE sns_channels @> '[{"type": "youtube"}]';
```

---

## 10. 마이그레이션 가이드

### 10.1 Supabase CLI 사용

```bash
# 마이그레이션 실행
supabase migration up

# 특정 마이그레이션 실행
supabase migration up --target 20250930000001

# 롤백
supabase migration down

# 마이그레이션 상태 확인
supabase migration list
```

### 10.2 마이그레이션 파일 구조

```
/supabase/
  └── migrations/
      ├── 20250930000001_initial_schema.sql
      └── 20250930000002_seed_data.sql
```

### 10.3 초기 스키마 마이그레이션

파일: `20250930000001_initial_schema.sql`

**포함 내용**:
1. 테이블 생성 (순서: users → profiles → campaigns → applications)
2. 인덱스 생성
3. RLS 활성화 및 정책 설정
4. 트리거 (updated_at 자동 업데이트)
5. 함수 (헬퍼 함수)

### 10.4 updated_at 자동 업데이트 트리거

```sql
-- 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- (나머지 테이블도 동일하게 적용)
```

---

## 11. 부록

### 11.1 데이터 타입 선택 기준

| 데이터 유형 | PostgreSQL 타입 | 이유 |
|-------------|-----------------|------|
| ID (Primary Key) | UUID | 분산 환경 호환, 보안 |
| 이메일 | VARCHAR(255) | 표준 길이 |
| 이름, 업체명 | VARCHAR(100-200) | 한글 기준 적절 |
| 전화번호 | VARCHAR(20) | 하이픈 포함 가능 |
| 날짜 | DATE | 시간 불필요 |
| 타임스탬프 | TIMESTAMP WITH TIME ZONE | 타임존 고려 |
| 텍스트 (긴 내용) | TEXT | 길이 제한 없음 |
| 구조화 데이터 | JSONB | 유연성, 인덱싱 가능 |
| 좌표 | DECIMAL(10, 8) / DECIMAL(11, 8) | 정밀도 보장 |
| 불린 | BOOLEAN | 명확성 |

### 11.2 성능 최적화 팁

1. **복합 인덱스 활용**: WHERE 절에 자주 함께 사용되는 컬럼
2. **JSONB GIN 인덱스**: JSONB 필드 검색 시 필수
3. **Partial Index**: WHERE 조건이 자주 사용되는 경우 (예: deleted_at IS NULL)
4. **Connection Pooling**: Supabase는 기본 제공
5. **EXPLAIN ANALYZE**: 쿼리 성능 분석
6. **Materialized View**: 통계성 데이터는 주기적 갱신

### 11.3 백업 및 복구

```bash
# Supabase 백업 (자동)
# - 시점 복구 (Point-in-Time Recovery) 지원
# - 일일 자동 백업

# 수동 백업
pg_dump -h db.supabase.co -U postgres -d postgres > backup.sql

# 복구
psql -h db.supabase.co -U postgres -d postgres < backup.sql
```

---

## 문서 버전
- 버전: 1.0
- 최종 수정일: 2025-09-30
- 작성자: PRD 및 유저플로우 기반 데이터베이스 설계
- 기반 문서: `/docs/prd.md`, `/docs/userflow.md`