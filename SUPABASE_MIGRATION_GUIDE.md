# 🚀 Supabase 마이그레이션 적용 가이드

## ⚠️ 현재 상황
- Supabase에 이미 테이블이 생성되어 있음
- DB 스키마와 백엔드 코드 간 불일치 발견
- campaigns 테이블 수정 필요

---

## 📋 빠른 적용 방법 (5분)

### 1단계: Supabase Dashboard 접속

1. 브라우저에서 https://supabase.com/dashboard 접속
2. 로그인
3. 프로젝트 선택: **blog_exp** (kpybrhigsqnlxlaageby)

### 2단계: SQL Editor 열기

1. 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. 오른쪽 상단 **"New Query"** 클릭

### 3단계: 마이그레이션 SQL 복사 & 실행

아래 SQL을 복사해서 SQL Editor에 붙여넣고 **"Run"** 클릭:

```sql
-- ============================================================================
-- campaigns 테이블 스키마 수정
-- ============================================================================

-- 1. 기존 제약조건 제거
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_max_applicants_check;

-- 2. 컬럼명 변경
ALTER TABLE campaigns RENAME COLUMN max_applicants TO total_recruits;

-- 3. 새로운 컬럼 추가
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 4. 기존 컬럼 제약조건 변경
ALTER TABLE campaigns ALTER COLUMN thumbnail_url DROP NOT NULL;
ALTER TABLE campaigns ALTER COLUMN store_info DROP NOT NULL;

-- 5. 새로운 제약조건 추가
ALTER TABLE campaigns ADD CONSTRAINT campaigns_total_recruits_check
  CHECK (total_recruits > 0);

ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('recruiting', 'in_progress', 'completed', 'canceled'));

-- 6. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_campaigns_region ON campaigns(region);

CREATE INDEX IF NOT EXISTS idx_campaigns_region_status
  ON campaigns(region, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- 7. 코멘트 업데이트
COMMENT ON COLUMN campaigns.status IS '상태: recruiting(모집중), in_progress(진행중), completed(완료), canceled(취소됨)';
COMMENT ON COLUMN campaigns.region IS '지역 정보 (예: 서울, 경기, 부산 등)';
COMMENT ON COLUMN campaigns.total_recruits IS '총 모집 인원';
COMMENT ON COLUMN campaigns.latitude IS '위도 (매장 위치)';
COMMENT ON COLUMN campaigns.longitude IS '경도 (매장 위치)';
COMMENT ON COLUMN campaigns.store_info IS '매장 상세 정보 (JSONB): {"store_name":"...","address":"...","phone":"...","hours":"..."}';

-- 8. 기존 데이터 마이그레이션 (있는 경우)
UPDATE campaigns SET status = 'in_progress' WHERE status = 'ended';
UPDATE campaigns SET status = 'canceled' WHERE status = 'closed';

-- 완료!
SELECT 'Migration completed successfully! ✅' AS result;
```

### 4단계: 결과 확인

에러 없이 `Migration completed successfully! ✅` 가 나오면 성공!

---

## 🔍 변경 사항 확인

적용 후 다음 쿼리로 확인:

```sql
-- campaigns 테이블 컬럼 확인
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'campaigns'
  AND column_name IN ('total_recruits', 'region', 'latitude', 'longitude', 'thumbnail_url', 'store_info')
ORDER BY column_name;
```

**예상 결과:**
```
total_recruits  | integer | NO
region          | varchar | YES
latitude        | numeric | YES
longitude       | numeric | YES
thumbnail_url   | text    | YES
store_info      | jsonb   | YES
```

---

## ✅ 변경된 내용 요약

### campaigns 테이블:

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| **컬럼명** | `max_applicants` | `total_recruits` |
| **새 컬럼** | - | `region`, `latitude`, `longitude` |
| **thumbnail_url** | NOT NULL | NULL 허용 |
| **store_info** | NOT NULL | NULL 허용 |
| **status 값** | recruiting, ended, completed, closed | recruiting, in_progress, completed, canceled |

---

## ❌ 에러 발생 시

### "relation does not exist"
- campaigns 테이블이 없는 경우
- 먼저 `20250930000001_initial_schema.sql` 전체를 실행해야 함

### "column already exists"
- 이미 컬럼이 존재하는 경우
- `IF NOT EXISTS` 구문이 있으므로 무시해도 됨
- 계속 진행

### "constraint ... does not exist"
- 제약조건이 없는 경우
- `IF EXISTS` 구문이 있으므로 무시해도 됨
- 계속 진행

---

## 🎯 다음 단계

마이그레이션 완료 후:

1. ✅ 애플리케이션 테스트: https://supernext-hfe4u09ja-lovepauls-projects-29bc01ef.vercel.app
2. ✅ 회원가입 → 온보딩 → 체험단 등록 테스트
3. ✅ 데이터 정상 입력 확인

---

## 📞 도움이 필요한 경우

마이그레이션 중 문제가 발생하면:
1. 에러 메시지 전체 복사
2. 현재 SQL 위치 확인
3. 다시 시도하거나 문의
