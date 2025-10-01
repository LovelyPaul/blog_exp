# Database Migrations

## 🚀 빠른 시작 (Clean Install)

새로 시작하거나 DB를 완전히 초기화하려면:

### 1단계: 기존 데이터베이스 초기화 (선택사항)
```sql
-- Supabase Dashboard → SQL Editor → New Query
-- 파일: 00000000000000_reset_database.sql 실행
```
⚠️ **경고**: 모든 데이터가 삭제됩니다!

### 2단계: 최신 스키마 적용
```sql
-- Supabase Dashboard → SQL Editor → New Query
-- 파일: 99999999999999_complete_schema.sql 실행
```

완료! 이제 애플리케이션을 실행할 수 있습니다.

---

## 📋 마이그레이션 파일 목록

### 초기화 파일 (권장)
- **`00000000000000_reset_database.sql`** - 모든 테이블 삭제 (초기화용)
- **`99999999999999_complete_schema.sql`** - 최신 전체 스키마 (권장)

### 단계별 마이그레이션 파일
1. **`20250930000001_initial_schema.sql`** - 초기 데이터베이스 스키마
2. **`20250930000002_seed_data.sql`** - 초기 시드 데이터
3. **`20251001000001_fix_campaigns_schema.sql`** - campaigns 테이블 스키마 수정
4. **`20251001000002_add_advertiser_profile_to_campaigns.sql`** - advertiser_profile_id 추가

---

## 🔧 Supabase에 마이그레이션 적용 방법

### 옵션 A: 완전 초기화 (권장 ⭐)

```bash
# 1. Supabase Dashboard → SQL Editor
# 2. New Query 클릭
# 3. 00000000000000_reset_database.sql 내용 복사 → 붙여넣기 → Run
# 4. New Query 클릭
# 5. 99999999999999_complete_schema.sql 내용 복사 → 붙여넣기 → Run
```

### 옵션 B: 단계별 업그레이드

기존 데이터를 유지하면서 순차적으로 업그레이드:

```bash
# 순서대로 실행:
# 1. 20250930000001_initial_schema.sql (처음인 경우)
# 2. 20251001000001_fix_campaigns_schema.sql
# 3. 20251001000002_add_advertiser_profile_to_campaigns.sql (필수!)
```

### Supabase Dashboard 접속 방법

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. 왼쪽 메뉴 → SQL Editor 클릭
4. New Query 버튼 클릭
5. migration 파일 내용 복사 → 붙여넣기
6. Run 버튼 클릭

---

### 방법 2: Supabase CLI (로컬 개발)

로컬에서 Supabase CLI를 사용하는 경우:

```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref kpybrhigsqnlxlaageby

# 마이그레이션 적용
supabase db push

# 또는 개별 마이그레이션 실행
supabase db execute --file supabase/migrations/20251001000001_fix_campaigns_schema.sql
```

---

## 현재 적용해야 할 마이그레이션

### ⚠️ 중요: 이미 Supabase에 테이블을 생성한 경우

**다음 마이그레이션만 실행하세요:**

📄 **`20251001000001_fix_campaigns_schema.sql`**

이 파일은:
- ✅ 기존 데이터를 보존하면서 스키마 수정
- ✅ 컬럼명 변경 (max_applicants → total_recruits)
- ✅ 새 컬럼 추가 (region, latitude, longitude)
- ✅ status 값 변경 (ended → in_progress, closed → canceled)
- ✅ 제약조건 업데이트

---

## 적용 후 확인

마이그레이션 적용 후 다음 쿼리로 확인:

```sql
-- campaigns 테이블 구조 확인
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;

-- status 제약조건 확인
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'campaigns'
  AND con.contype = 'c';
```

---

## 문제 해결

### 에러: "column already exists"
- 이미 컬럼이 존재하는 경우 발생
- `IF NOT EXISTS` 구문이 있으므로 무시해도 됨

### 에러: "constraint does not exist"
- 제약조건이 없는 경우 발생
- `IF EXISTS` 구문이 있으므로 무시해도 됨

### 에러: "check constraint violated"
- 기존 데이터가 새로운 제약조건을 위반하는 경우
- 데이터를 먼저 수정하거나 제약조건을 조정해야 함

---

## 다음 단계

1. ✅ 마이그레이션 적용
2. ✅ 테이블 구조 확인
3. ✅ 애플리케이션 테스트
4. ✅ 데이터 입력 테스트
