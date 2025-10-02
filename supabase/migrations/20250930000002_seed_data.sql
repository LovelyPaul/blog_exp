-- ============================================================================
-- Migration: Seed Data (Development/Testing)
-- Version: 20250930000002
-- Description: 개발 및 테스트용 샘플 데이터
-- Author: Database Design Team
-- Date: 2025-09-30
-- Note: 프로덕션 환경에서는 이 마이그레이션을 실행하지 마세요
-- ============================================================================

-- WARNING: This migration is for development/testing only
-- DO NOT run this in production

-- ============================================================================
-- 1. Sample Users
-- ============================================================================

-- 샘플 인플루언서 (2명)
INSERT INTO users (id, email, role, onboarding_completed, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'influencer1@example.com', 'influencer', true, NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'influencer2@example.com', 'influencer', true, NOW() - INTERVAL '25 days');

-- 샘플 광고주 (2명)
INSERT INTO users (id, email, role, onboarding_completed, created_at) VALUES
  ('33333333-3333-3333-3333-333333333333', 'advertiser1@example.com', 'advertiser', true, NOW() - INTERVAL '20 days'),
  ('44444444-4444-4444-4444-444444444444', 'advertiser2@example.com', 'advertiser', true, NOW() - INTERVAL '15 days');

-- ============================================================================
-- 2. User Agreements
-- ============================================================================

INSERT INTO user_agreements (user_id, agreement_type, agreement_version, is_agreed) VALUES
  -- Influencer 1
  ('11111111-1111-1111-1111-111111111111', 'terms', '1.0', true),
  ('11111111-1111-1111-1111-111111111111', 'privacy', '1.0', true),
  ('11111111-1111-1111-1111-111111111111', 'marketing', '1.0', true),
  -- Influencer 2
  ('22222222-2222-2222-2222-222222222222', 'terms', '1.0', true),
  ('22222222-2222-2222-2222-222222222222', 'privacy', '1.0', true),
  ('22222222-2222-2222-2222-222222222222', 'marketing', '1.0', false),
  -- Advertiser 1
  ('33333333-3333-3333-3333-333333333333', 'terms', '1.0', true),
  ('33333333-3333-3333-3333-333333333333', 'privacy', '1.0', true),
  -- Advertiser 2
  ('44444444-4444-4444-4444-444444444444', 'terms', '1.0', true),
  ('44444444-4444-4444-4444-444444444444', 'privacy', '1.0', true);

-- ============================================================================
-- 3. Influencer Profiles
-- ============================================================================

INSERT INTO influencer_profiles (user_id, name, phone, birth_date, sns_channels, categories) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '김인플',
    '010-1234-5678',
    '1995-03-15',
    '[
      {"type":"naver","channel_name":"kiminfluencer","url":"https://blog.naver.com/kiminfluencer"},
      {"type":"instagram","channel_name":"kim_influencer","url":"https://instagram.com/kim_influencer"}
    ]'::jsonb,
    ARRAY['음식', '카페']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '이블로거',
    '010-2345-6789',
    '1998-07-22',
    '[
      {"type":"youtube","channel_name":"LeeBlogger","url":"https://youtube.com/@LeeBlogger"},
      {"type":"threads","channel_name":"lee_blogger","url":"https://threads.net/@lee_blogger"}
    ]'::jsonb,
    ARRAY['뷰티', '패션']
  );

-- ============================================================================
-- 4. Advertiser Profiles
-- ============================================================================

INSERT INTO advertiser_profiles (
  user_id,
  name,
  phone,
  business_name,
  business_number,
  business_category,
  representative_name,
  address,
  address_detail,
  latitude,
  longitude,
  verification_status
) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    '박광고',
    '02-1234-5678',
    '맛있는 카페',
    '1234567890',
    '카페',
    '박광고',
    '서울시 강남구 테헤란로 123',
    '3층',
    37.5012345,
    127.0398765,
    'verified'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '최사장',
    '02-2345-6789',
    '프리미엄 뷰티샵',
    '0987654321',
    '뷰티',
    '최사장',
    '서울시 서초구 강남대로 456',
    '1층',
    37.4912345,
    127.0298765,
    'verified'
  );

-- ============================================================================
-- 5. Campaigns
-- ============================================================================

-- 광고주 1의 체험단 (모집중)
INSERT INTO campaigns (
  id,
  advertiser_id,
  title,
  category,
  thumbnail_url,
  additional_images,
  start_date,
  end_date,
  total_recruits,
  benefits,
  missions,
  notes,
  store_info,
  status,
  applicants_count,
  view_count,
  created_at
) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    '맛있는 카페 신메뉴 체험단 모집',
    '카페',
    'https://picsum.photos/seed/cafe1/800/600',
    '["https://picsum.photos/seed/cafe1-1/800/600","https://picsum.photos/seed/cafe1-2/800/600"]'::jsonb,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days',
    10,
    '<h2>제공 혜택</h2><ul><li>시그니처 커피 2잔 + 디저트 2개 무료 제공</li><li>포스팅 리워드 1만원 지급</li></ul>',
    '<h2>미션</h2><ol><li>매장 방문 후 인증샷 촬영</li><li>네이버 블로그 또는 인스타그램에 리뷰 작성 (최소 5장 사진, 300자 이상)</li><li>해시태그 필수: #맛있는카페 #강남카페 #체험단</li></ol>',
    '주차 불가능하니 대중교통 이용 부탁드립니다.',
    '{
      "store_name":"맛있는 카페",
      "address":"서울시 강남구 테헤란로 123",
      "phone":"02-1234-5678",
      "hours":"매일 10:00 - 22:00",
      "latitude":37.5012345,
      "longitude":127.0398765
    }'::jsonb,
    'recruiting',
    2,
    156,
    NOW() - INTERVAL '5 days'
  );

-- 광고주 2의 체험단 (모집중)
INSERT INTO campaigns (
  id,
  advertiser_id,
  title,
  category,
  thumbnail_url,
  additional_images,
  start_date,
  end_date,
  total_recruits,
  benefits,
  missions,
  notes,
  store_info,
  status,
  applicants_count,
  view_count,
  created_at
) VALUES
  (
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    '프리미엄 뷰티샵 피부관리 체험단',
    '뷰티',
    'https://picsum.photos/seed/beauty1/800/600',
    '["https://picsum.photos/seed/beauty1-1/800/600"]'::jsonb,
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '15 days',
    5,
    '<h2>제공 혜택</h2><ul><li>프리미엄 피부관리 1회 무료 (정상가 15만원)</li><li>다음 방문 시 사용 가능한 30% 할인쿠폰</li></ul>',
    '<h2>미션</h2><ol><li>관리 전/후 사진 촬영</li><li>블로그 또는 유튜브에 솔직한 리뷰 작성</li><li>인스타그램 스토리 업로드 (멘션 필수)</li></ol>',
    '예약제로 운영되니 사전 연락 필수입니다.',
    '{
      "store_name":"프리미엄 뷰티샵",
      "address":"서울시 서초구 강남대로 456",
      "phone":"02-2345-6789",
      "hours":"평일 10:00 - 20:00, 주말 11:00 - 19:00",
      "latitude":37.4912345,
      "longitude":127.0298765
    }'::jsonb,
    'recruiting',
    1,
    89,
    NOW() - INTERVAL '3 days'
  );

-- 광고주 1의 체험단 (모집종료 - 선정 전)
INSERT INTO campaigns (
  id,
  advertiser_id,
  title,
  category,
  thumbnail_url,
  additional_images,
  start_date,
  end_date,
  total_recruits,
  benefits,
  missions,
  notes,
  store_info,
  status,
  applicants_count,
  view_count,
  created_at
) VALUES
  (
    '77777777-7777-7777-7777-777777777777',
    '33333333-3333-3333-3333-333333333333',
    '맛있는 카페 브런치 메뉴 체험단',
    '카페',
    'https://picsum.photos/seed/brunch1/800/600',
    '[]'::jsonb,
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE - INTERVAL '1 day',
    8,
    '<h2>제공 혜택</h2><ul><li>브런치 세트 2인분 무료</li></ul>',
    '<h2>미션</h2><ol><li>블로그 리뷰 작성</li></ol>',
    NULL,
    '{
      "store_name":"맛있는 카페",
      "address":"서울시 강남구 테헤란로 123",
      "phone":"02-1234-5678",
      "hours":"매일 10:00 - 22:00",
      "latitude":37.5012345,
      "longitude":127.0398765
    }'::jsonb,
    'ended',
    5,
    234,
    NOW() - INTERVAL '20 days'
  );

-- ============================================================================
-- 6. Applications
-- ============================================================================

-- 체험단 1에 대한 지원
INSERT INTO applications (
  campaign_id,
  influencer_id,
  message,
  visit_date,
  selected_sns_channel,
  status,
  created_at
) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    '11111111-1111-1111-1111-111111111111',
    '강남 지역 카페 리뷰를 주로 하는 블로거입니다. 맛있는 카페의 신메뉴를 많은 분들께 알려드리고 싶습니다!',
    CURRENT_DATE + INTERVAL '5 days',
    '{"type":"naver","channel_name":"kiminfluencer","url":"https://blog.naver.com/kiminfluencer"}'::jsonb,
    'pending',
    NOW() - INTERVAL '3 days'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    '유튜브와 스레드를 통해 다양한 카페 컨텐츠를 제작하고 있습니다. 신메뉴를 영상과 글로 소개하겠습니다!',
    CURRENT_DATE + INTERVAL '7 days',
    '{"type":"youtube","channel_name":"LeeBlogger","url":"https://youtube.com/@LeeBlogger"}'::jsonb,
    'pending',
    NOW() - INTERVAL '2 days'
  );

-- 체험단 2에 대한 지원
INSERT INTO applications (
  campaign_id,
  influencer_id,
  message,
  visit_date,
  selected_sns_channel,
  status,
  created_at
) VALUES
  (
    '66666666-6666-6666-6666-666666666666',
    '22222222-2222-2222-2222-222222222222',
    '뷰티 관련 콘텐츠를 전문적으로 다루고 있습니다. 피부관리 체험을 상세하게 리뷰하겠습니다!',
    CURRENT_DATE + INTERVAL '10 days',
    '{"type":"youtube","channel_name":"LeeBlogger","url":"https://youtube.com/@LeeBlogger"}'::jsonb,
    'pending',
    NOW() - INTERVAL '1 day'
  );

-- 체험단 3에 대한 지원 (종료된 체험단)
INSERT INTO applications (
  campaign_id,
  influencer_id,
  message,
  visit_date,
  selected_sns_channel,
  status,
  created_at
) VALUES
  (
    '77777777-7777-7777-7777-777777777777',
    '11111111-1111-1111-1111-111111111111',
    '브런치 메뉴 리뷰 경험이 많습니다!',
    CURRENT_DATE - INTERVAL '5 days',
    '{"type":"naver","channel_name":"kiminfluencer","url":"https://blog.naver.com/kiminfluencer"}'::jsonb,
    'pending',
    NOW() - INTERVAL '15 days'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '22222222-2222-2222-2222-222222222222',
    '영상으로 브런치 메뉴를 소개하겠습니다.',
    CURRENT_DATE - INTERVAL '5 days',
    '{"type":"youtube","channel_name":"LeeBlogger","url":"https://youtube.com/@LeeBlogger"}'::jsonb,
    'pending',
    NOW() - INTERVAL '14 days'
  );

-- ============================================================================
-- 7. Seed Data Summary
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Seed Data Summary ===';
  RAISE NOTICE 'Users created: 4 (2 influencers, 2 advertisers)';
  RAISE NOTICE 'User agreements created: 10';
  RAISE NOTICE 'Influencer profiles created: 2';
  RAISE NOTICE 'Advertiser profiles created: 2';
  RAISE NOTICE 'Campaigns created: 3 (2 recruiting, 1 ended)';
  RAISE NOTICE 'Applications created: 5';
  RAISE NOTICE '';
  RAISE NOTICE '=== Test Accounts ===';
  RAISE NOTICE 'Influencer 1: influencer1@example.com';
  RAISE NOTICE 'Influencer 2: influencer2@example.com';
  RAISE NOTICE 'Advertiser 1: advertiser1@example.com';
  RAISE NOTICE 'Advertiser 2: advertiser2@example.com';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration 20250930000002_seed_data.sql completed';
END $$;