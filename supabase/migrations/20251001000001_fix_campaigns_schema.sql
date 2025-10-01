-- ============================================================================
-- Migration: Fix Campaigns Schema
-- Version: 20251001000001
-- Description: campaigns 테이블을 백엔드 코드에 맞춰 수정
-- Author: Schema Sync
-- Date: 2025-10-01
-- ============================================================================

-- ============================================================================
-- 1. 기존 제약조건 제거
-- ============================================================================

-- status CHECK 제약조건 제거
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- max_applicants CHECK 제약조건 제거
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_max_applicants_check;

-- ============================================================================
-- 2. 컬럼명 변경
-- ============================================================================

-- max_applicants -> total_recruits 로 컬럼명 변경
ALTER TABLE campaigns RENAME COLUMN max_applicants TO total_recruits;

-- ============================================================================
-- 3. 새로운 컬럼 추가
-- ============================================================================

-- 지역 정보 추가
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS region VARCHAR(50);

-- 위치 정보 추가
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- ============================================================================
-- 4. 기존 컬럼 제약조건 변경
-- ============================================================================

-- thumbnail_url을 nullable로 변경
ALTER TABLE campaigns ALTER COLUMN thumbnail_url DROP NOT NULL;

-- store_info를 nullable로 변경
ALTER TABLE campaigns ALTER COLUMN store_info DROP NOT NULL;

-- ============================================================================
-- 5. 새로운 제약조건 추가
-- ============================================================================

-- total_recruits CHECK 제약조건 추가
ALTER TABLE campaigns ADD CONSTRAINT campaigns_total_recruits_check
  CHECK (total_recruits > 0);

-- status CHECK 제약조건 추가 (새로운 값들)
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('recruiting', 'in_progress', 'completed', 'canceled'));

-- ============================================================================
-- 6. 인덱스 추가
-- ============================================================================

-- 지역별 인덱스
CREATE INDEX IF NOT EXISTS idx_campaigns_region ON campaigns(region);

-- 지역별 검색 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_campaigns_region_status
  ON campaigns(region, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- 7. 코멘트 업데이트
-- ============================================================================

COMMENT ON COLUMN campaigns.status IS '상태: recruiting(모집중), in_progress(진행중), completed(완료), canceled(취소됨)';
COMMENT ON COLUMN campaigns.region IS '지역 정보 (예: 서울, 경기, 부산 등)';
COMMENT ON COLUMN campaigns.total_recruits IS '총 모집 인원';
COMMENT ON COLUMN campaigns.latitude IS '위도 (매장 위치)';
COMMENT ON COLUMN campaigns.longitude IS '경도 (매장 위치)';
COMMENT ON COLUMN campaigns.store_info IS '매장 상세 정보 (JSONB): {"store_name":"...","address":"...","phone":"...","hours":"..."}';

-- ============================================================================
-- 8. 기존 데이터 마이그레이션 (있는 경우)
-- ============================================================================

-- 기존 status 값 변경
-- 'ended' -> 'in_progress', 'closed' -> 'canceled'
UPDATE campaigns SET status = 'in_progress' WHERE status = 'ended';
UPDATE campaigns SET status = 'canceled' WHERE status = 'closed';

-- ============================================================================
-- 완료
-- ============================================================================

-- 마이그레이션 완료 확인
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251001000001_fix_campaigns_schema.sql completed successfully';
END $$;
