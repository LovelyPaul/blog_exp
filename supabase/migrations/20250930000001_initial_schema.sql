-- ============================================================================
-- Migration: Initial Schema
-- Version: 20250930000001
-- Description: 블로그 체험단 SaaS 초기 스키마 생성
-- Author: Database Design based on PRD and User Flows
-- Date: 2025-09-30
-- ============================================================================

-- ============================================================================
-- 1. Extensions
-- ============================================================================

-- UUID 생성을 위한 확장 (Supabase는 기본 활성화)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. Helper Functions
-- ============================================================================

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'updated_at 컬럼을 자동으로 현재 시간으로 업데이트';

-- ============================================================================
-- 3. Tables
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 users (사용자 인증 테이블)
-- ----------------------------------------------------------------------------
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

-- 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.2 user_agreements (약관 동의 이력)
-- ----------------------------------------------------------------------------
CREATE TABLE user_agreements (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 약관 정보
  agreement_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'marketing' 등
  agreement_version VARCHAR(20) NOT NULL,
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

-- ----------------------------------------------------------------------------
-- 3.3 influencer_profiles (인플루언서 프로필)
-- ----------------------------------------------------------------------------
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
COMMENT ON COLUMN influencer_profiles.sns_channels IS 'SNS 채널 정보 (JSONB 배열): [{"type":"naver","channel_name":"...","url":"..."},...]';
COMMENT ON COLUMN influencer_profiles.categories IS '주요 활동 카테고리 (음식/뷰티/패션 등)';

-- 트리거
CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.4 advertiser_profiles (광고주 프로필)
-- ----------------------------------------------------------------------------
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

  -- 검증 상태
  verification_status VARCHAR(20) DEFAULT 'pending',

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
COMMENT ON COLUMN advertiser_profiles.verification_status IS '사업자번호 검증 상태: pending, verified, failed';

-- 트리거
CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.5 campaigns (체험단)
-- ----------------------------------------------------------------------------
CREATE TABLE campaigns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 기본 정보
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,

  -- 이미지
  thumbnail_url TEXT NOT NULL,
  additional_images JSONB DEFAULT '[]'::jsonb,

  -- 모집 정보
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_applicants INTEGER NOT NULL CHECK (max_applicants > 0),

  -- 콘텐츠 (리치 텍스트)
  benefits TEXT NOT NULL,
  missions TEXT NOT NULL,
  notes TEXT,

  -- 매장 정보 (JSONB)
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
COMMENT ON COLUMN campaigns.store_info IS '매장 상세 정보 (JSONB): {"store_name":"...","address":"...","phone":"...","hours":"...","latitude":...,"longitude":...}';
COMMENT ON COLUMN campaigns.additional_images IS '추가 이미지 URL 배열 (JSONB)';

-- 트리거
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.6 applications (지원 내역)
-- ----------------------------------------------------------------------------
CREATE TABLE applications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 지원 정보
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  selected_sns_channel JSONB NOT NULL,

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
COMMENT ON COLUMN applications.selected_sns_channel IS '지원 시 선택한 SNS 채널 (JSONB)';

-- 트리거
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Row Level Security (RLS)
-- ============================================================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4.1 users 정책
-- ----------------------------------------------------------------------------

-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (id = auth.uid());

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4.2 user_agreements 정책
-- ----------------------------------------------------------------------------

-- 사용자는 자신의 약관 동의 내역만 조회 가능
CREATE POLICY "Users can view own agreements"
ON user_agreements FOR SELECT
USING (user_id = auth.uid());

-- 사용자는 자신의 약관 동의만 생성 가능
CREATE POLICY "Users can insert own agreements"
ON user_agreements FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4.3 influencer_profiles 정책
-- ----------------------------------------------------------------------------

-- 인플루언서는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Influencers can manage own profile"
ON influencer_profiles FOR ALL
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

-- ----------------------------------------------------------------------------
-- 4.4 advertiser_profiles 정책
-- ----------------------------------------------------------------------------

-- 광고주는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Advertisers can manage own profile"
ON advertiser_profiles FOR ALL
USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4.5 campaigns 정책
-- ----------------------------------------------------------------------------

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

-- ----------------------------------------------------------------------------
-- 4.6 applications 정책
-- ----------------------------------------------------------------------------

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

-- ============================================================================
-- 5. Additional Helper Functions (Optional)
-- ============================================================================

-- 체험단 지원자 수 계산 함수
CREATE OR REPLACE FUNCTION get_campaign_applicants_count(campaign_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM applications
  WHERE campaign_id = campaign_uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_campaign_applicants_count(UUID) IS '특정 체험단의 지원자 수 반환';

-- 인플루언서의 총 지원 수 계산 함수
CREATE OR REPLACE FUNCTION get_influencer_applications_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM applications
  WHERE influencer_id = user_uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_influencer_applications_count(UUID) IS '특정 인플루언서의 총 지원 수 반환';

-- ============================================================================
-- 6. Migration Complete
-- ============================================================================

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE 'Migration 20250930000001_initial_schema.sql completed successfully';
  RAISE NOTICE 'Tables created: users, user_agreements, influencer_profiles, advertiser_profiles, campaigns, applications';
  RAISE NOTICE 'RLS policies enabled on all tables';
  RAISE NOTICE 'Indexes and triggers applied';
END $$;