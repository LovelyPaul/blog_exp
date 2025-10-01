-- ============================================================================
-- Migration: Reset Database (모든 테이블 삭제)
-- Version: 00000000000000
-- Description: 기존 데이터베이스를 완전히 초기화합니다. ⚠️ 주의: 모든 데이터가 삭제됩니다!
-- Author: Database Reset
-- Date: 2025-10-01
-- ============================================================================

-- ⚠️⚠️⚠️ 경고 ⚠️⚠️⚠️
-- 이 스크립트는 모든 테이블과 데이터를 삭제합니다!
-- 프로덕션 환경에서는 절대 실행하지 마세요!

-- ============================================================================
-- 1. 모든 정책(Policies) 삭제
-- ============================================================================

-- applications 테이블 정책 삭제
DROP POLICY IF EXISTS "Influencers can view own applications" ON applications;
DROP POLICY IF EXISTS "Advertisers can view applications for own campaigns" ON applications;
DROP POLICY IF EXISTS "Influencers can insert applications" ON applications;
DROP POLICY IF EXISTS "Advertisers can update applications for own campaigns" ON applications;

-- campaigns 테이블 정책 삭제
DROP POLICY IF EXISTS "Anyone can view recruiting campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can update own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Advertisers can delete own campaigns" ON campaigns;

-- advertiser_profiles 테이블 정책 삭제
DROP POLICY IF EXISTS "Advertisers can manage own profile" ON advertiser_profiles;

-- influencer_profiles 테이블 정책 삭제
DROP POLICY IF EXISTS "Influencers can manage own profile" ON influencer_profiles;
DROP POLICY IF EXISTS "Advertisers can view influencer profiles of applicants" ON influencer_profiles;

-- user_agreements 테이블 정책 삭제
DROP POLICY IF EXISTS "Users can view own agreements" ON user_agreements;
DROP POLICY IF EXISTS "Users can insert own agreements" ON user_agreements;

-- users 테이블 정책 삭제
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- ============================================================================
-- 2. 모든 테이블 삭제 (의존성 순서대로)
-- ============================================================================

DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS advertiser_profiles CASCADE;
DROP TABLE IF EXISTS influencer_profiles CASCADE;
DROP TABLE IF EXISTS user_agreements CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 3. 모든 함수 삭제
-- ============================================================================

DROP FUNCTION IF EXISTS get_campaign_applicants_count(UUID);
DROP FUNCTION IF EXISTS get_influencer_applications_count(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- 완료
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'Database Reset Complete!';
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'All tables have been dropped.';
  RAISE NOTICE 'All policies have been removed.';
  RAISE NOTICE 'All functions have been deleted.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run the latest schema migration file to recreate tables.';
  RAISE NOTICE '===========================================================';
END $$;
