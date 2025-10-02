-- ============================================================================
-- Migration: Update Campaign Thumbnails to picsum.photos
-- Version: 20251002000001
-- Description: 기존 캠페인의 썸네일 URL을 picsum.photos로 업데이트
-- ============================================================================

-- 모든 기존 캠페인의 썸네일을 picsum.photos로 업데이트
UPDATE campaigns
SET thumbnail_url = 'https://picsum.photos/seed/' || id || '/800/600'
WHERE thumbnail_url IS NULL OR thumbnail_url NOT LIKE 'https://picsum.photos%';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'Campaign thumbnails updated to picsum.photos URLs';
  RAISE NOTICE '===========================================================';
END $$;
