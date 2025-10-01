-- ============================================================================
-- Migration: Complete Schema (최신 버전)
-- Version: 99999999999999
-- Description: 블로그 체험단 SaaS 전체 스키마 (advertiser_profile_id 포함)
-- Author: Complete Database Schema
-- Date: 2025-10-01
-- ============================================================================

-- ============================================================================
-- 1. Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. Helper Functions
-- ============================================================================

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
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('influencer', 'advertiser')),
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

COMMENT ON TABLE users IS '사용자 인증 및 역할 관리 테이블';
COMMENT ON COLUMN users.role IS '사용자 역할: influencer(인플루언서) 또는 advertiser(광고주)';
COMMENT ON COLUMN users.onboarding_completed IS '온보딩 완료 여부 (역할별 프로필 정보 입력 완료)';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.2 user_agreements (약관 동의 이력)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreement_type VARCHAR(50) NOT NULL,
  agreement_version VARCHAR(20) NOT NULL,
  is_agreed BOOLEAN NOT NULL,
  agreed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_agreements_user_id ON user_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agreements_type ON user_agreements(agreement_type);

COMMENT ON TABLE user_agreements IS '사용자 약관 동의 이력';
COMMENT ON COLUMN user_agreements.agreement_type IS '약관 유형: terms(이용약관), privacy(개인정보), marketing(마케팅)';

-- ----------------------------------------------------------------------------
-- 3.3 influencer_profiles (인플루언서 프로필)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  birth_date DATE NOT NULL,
  sns_channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_influencer_profiles_user_id ON influencer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_sns_channels ON influencer_profiles USING GIN(sns_channels);

ALTER TABLE influencer_profiles DROP CONSTRAINT IF EXISTS check_birth_date_valid;
ALTER TABLE influencer_profiles
  ADD CONSTRAINT check_birth_date_valid
  CHECK (birth_date <= CURRENT_DATE - INTERVAL '14 years');

COMMENT ON TABLE influencer_profiles IS '인플루언서 프로필 정보';
COMMENT ON COLUMN influencer_profiles.sns_channels IS 'SNS 채널 정보 (JSONB 배열): [{"type":"naver","channel_name":"...","url":"..."},...]';
COMMENT ON COLUMN influencer_profiles.categories IS '주요 활동 카테고리 (음식/뷰티/패션 등)';

DROP TRIGGER IF EXISTS update_influencer_profiles_updated_at ON influencer_profiles;
CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.4 advertiser_profiles (광고주 프로필)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS advertiser_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  business_name VARCHAR(200) NOT NULL,
  business_number VARCHAR(12) UNIQUE NOT NULL,
  business_category VARCHAR(100) NOT NULL,
  representative_name VARCHAR(100),
  address VARCHAR(500) NOT NULL,
  address_detail VARCHAR(200),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verification_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_user_id ON advertiser_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_business_number ON advertiser_profiles(business_number);
CREATE INDEX IF NOT EXISTS idx_advertiser_profiles_location ON advertiser_profiles(latitude, longitude);

COMMENT ON TABLE advertiser_profiles IS '광고주 프로필 및 사업자 정보';
COMMENT ON COLUMN advertiser_profiles.business_number IS '사업자등록번호 (하이픈 제거, 10자리)';
COMMENT ON COLUMN advertiser_profiles.verification_status IS '사업자번호 검증 상태: pending, verified, failed';

DROP TRIGGER IF EXISTS update_advertiser_profiles_updated_at ON advertiser_profiles;
CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.5 campaigns (체험단) - advertiser_profile_id 포함
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advertiser_profile_id UUID REFERENCES advertiser_profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  region VARCHAR(50),
  thumbnail_url TEXT,
  additional_images JSONB DEFAULT '[]'::jsonb,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_recruits INTEGER NOT NULL CHECK (total_recruits > 0),
  benefits TEXT NOT NULL,
  missions TEXT NOT NULL,
  notes TEXT,
  store_info JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting'
    CHECK (status IN ('recruiting', 'in_progress', 'completed', 'canceled')),
  applicants_count INTEGER DEFAULT 0 NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_profile_id ON campaigns(advertiser_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_region ON campaigns(region);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted_at ON campaigns(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_recruiting ON campaigns(status, end_date, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_region_status ON campaigns(region, status, created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS check_dates_valid;
ALTER TABLE campaigns
  ADD CONSTRAINT check_dates_valid CHECK (end_date >= start_date);

COMMENT ON TABLE campaigns IS '체험단 정보';
COMMENT ON COLUMN campaigns.advertiser_profile_id IS '광고주 프로필 ID (advertiser_profiles 테이블 참조)';
COMMENT ON COLUMN campaigns.status IS '상태: recruiting(모집중), in_progress(진행중), completed(완료), canceled(취소됨)';
COMMENT ON COLUMN campaigns.region IS '지역 정보 (예: 서울, 경기, 부산 등)';
COMMENT ON COLUMN campaigns.total_recruits IS '총 모집 인원';
COMMENT ON COLUMN campaigns.latitude IS '위도 (매장 위치)';
COMMENT ON COLUMN campaigns.longitude IS '경도 (매장 위치)';
COMMENT ON COLUMN campaigns.store_info IS '매장 상세 정보 (JSONB): {"store_name":"...","address":"...","phone":"...","hours":"..."}';
COMMENT ON COLUMN campaigns.additional_images IS '추가 이미지 URL 배열 (JSONB)';

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.6 applications (지원 내역)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  visit_date DATE NOT NULL,
  selected_sns_channel JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'selected', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

DROP INDEX IF EXISTS unique_application_per_campaign;
CREATE UNIQUE INDEX unique_application_per_campaign
  ON applications(campaign_id, influencer_id)
  WHERE status != 'rejected';

CREATE INDEX IF NOT EXISTS idx_applications_campaign_status ON applications(campaign_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_influencer_status ON applications(influencer_id, status, created_at DESC);

COMMENT ON TABLE applications IS '체험단 지원 내역';
COMMENT ON COLUMN applications.message IS '각오 한마디 (최대 500자)';
COMMENT ON COLUMN applications.visit_date IS '방문 예정일';
COMMENT ON COLUMN applications.status IS '상태: pending(대기), selected(선정), rejected(반려)';
COMMENT ON COLUMN applications.selected_sns_channel IS '지원 시 선택한 SNS 채널 (JSONB)';

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Helper Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION get_campaign_applicants_count(campaign_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM applications
  WHERE campaign_id = campaign_uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_campaign_applicants_count(UUID) IS '특정 체험단의 지원자 수 반환';

CREATE OR REPLACE FUNCTION get_influencer_applications_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM applications
  WHERE influencer_id = user_uuid;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_influencer_applications_count(UUID) IS '특정 인플루언서의 총 지원 수 반환';

-- ============================================================================
-- 5. Row Level Security (RLS) - DISABLED
-- ============================================================================

-- RLS는 비활성화 상태로 유지 (백엔드에서 service-role 키 사용)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 완료
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'Complete Schema Migration Successful!';
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - user_agreements';
  RAISE NOTICE '  - influencer_profiles';
  RAISE NOTICE '  - advertiser_profiles';
  RAISE NOTICE '  - campaigns (with advertiser_profile_id)';
  RAISE NOTICE '  - applications';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes and triggers applied.';
  RAISE NOTICE 'Helper functions created.';
  RAISE NOTICE 'RLS is DISABLED (backend uses service-role key).';
  RAISE NOTICE '===========================================================';
END $$;
