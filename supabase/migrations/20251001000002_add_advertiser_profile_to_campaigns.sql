-- ============================================================================
-- Migration: Add advertiser_profile relationship to campaigns
-- Version: 20251001000002
-- Description: campaigns 테이블에 advertiser_profiles와의 직접 관계 추가
-- Author: Schema Fix
-- Date: 2025-10-01
-- ============================================================================

-- ============================================================================
-- 1. advertiser_profile_id 컬럼 추가
-- ============================================================================

-- campaigns 테이블에 advertiser_profile_id 컬럼 추가
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS advertiser_profile_id UUID;

-- ============================================================================
-- 2. 외래 키 제약조건 추가
-- ============================================================================

-- advertiser_profiles 테이블과의 관계 설정
ALTER TABLE campaigns
  ADD CONSTRAINT fk_campaigns_advertiser_profile
  FOREIGN KEY (advertiser_profile_id)
  REFERENCES advertiser_profiles(id)
  ON DELETE CASCADE;

-- ============================================================================
-- 3. 기존 데이터 마이그레이션
-- ============================================================================

-- 기존 campaigns의 advertiser_id를 기반으로 advertiser_profile_id 채우기
UPDATE campaigns
SET advertiser_profile_id = ap.id
FROM advertiser_profiles ap
WHERE campaigns.advertiser_id = ap.user_id
  AND campaigns.advertiser_profile_id IS NULL;

-- ============================================================================
-- 4. 인덱스 추가
-- ============================================================================

-- advertiser_profile_id 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_profile_id
  ON campaigns(advertiser_profile_id);

-- ============================================================================
-- 5. 코멘트 추가
-- ============================================================================

COMMENT ON COLUMN campaigns.advertiser_profile_id IS '광고주 프로필 ID (advertiser_profiles 테이블 참조)';

-- ============================================================================
-- 완료
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20251001000002_add_advertiser_profile_to_campaigns.sql completed successfully';
  RAISE NOTICE 'Added advertiser_profile_id column to campaigns table';
  RAISE NOTICE 'Migrated existing data to use advertiser_profile_id';
END $$;
