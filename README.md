# 체험단 매칭 플랫폼 (Campaign Matching Platform)

광고주와 인플루언서를 연결하는 블로그 리뷰 체험단 매칭 SaaS 플랫폼입니다.

## 📋 프로젝트 개요

### 핵심 기능
- **광고주**: 체험단 등록, 모집 관리, 지원자 선정, 진행 상황 추적
- **인플루언서**: 체험단 탐색, 지원, 선정 결과 확인, 리뷰 작성
- **인증 시스템**: Supabase Auth 기반 이메일 회원가입/로그인
- **온보딩**: 역할별(광고주/인플루언서) 맞춤 프로필 설정

### 주요 특징
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ Hono 기반 백엔드 API (Next.js Route Handler)
- ✅ Supabase Auth & Database
- ✅ React Query로 서버 상태 관리
- ✅ Shadcn UI + Tailwind CSS
- ✅ 완전한 타입 안정성 (Zod 스키마)

---

## 🚀 시작하기

### 필수 요구사항
- Node.js 20.x 이상
- npm 또는 yarn, pnpm, bun
- Supabase 프로젝트 (무료 플랜 가능)

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API (선택사항, 기본값 사용 가능)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 데이터베이스 마이그레이션

Supabase 대시보드의 SQL Editor에서 마이그레이션 파일을 실행하세요:

```bash
# 순서대로 실행
1. supabase/migrations/20250930000001_initial_schema.sql
2. supabase/migrations/20251001000001_fix_campaigns_schema.sql
3. supabase/migrations/20250930000002_seed_data.sql (선택사항: 테스트 데이터)
```

자세한 내용은 [supabase/migrations/README.md](./supabase/migrations/README.md)를 참조하세요.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

---

## 📂 프로젝트 구조

```
supernext/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/[[...hono]]/          # Hono API 엔트리포인트
│   │   ├── (auth)/                    # 인증 관련 페이지
│   │   │   ├── login/                 # 로그인
│   │   │   └── signup/                # 회원가입
│   │   ├── campaigns/                 # 체험단 공개 페이지
│   │   │   └── [id]/                  # 체험단 상세 & 지원
│   │   ├── my/                        # 마이페이지
│   │   │   ├── profile/               # 프로필 관리
│   │   │   ├── applications/          # 내 지원 목록 (인플루언서)
│   │   │   └── campaigns/             # 내 체험단 관리 (광고주)
│   │   ├── onboarding/                # 온보딩 (프로필 설정)
│   │   └── page.tsx                   # 홈페이지 (체험단 목록)
│   │
│   ├── backend/                       # 백엔드 레이어
│   │   ├── hono/                      # Hono 앱 설정
│   │   │   ├── app.ts                 # 싱글턴 앱 생성
│   │   │   └── context.ts             # AppEnv 타입 정의
│   │   ├── middleware/                # 공통 미들웨어
│   │   │   ├── error.ts               # 에러 핸들링
│   │   │   ├── context.ts             # 컨텍스트 주입
│   │   │   ├── auth.ts                # 인증 미들웨어
│   │   │   └── supabase.ts            # Supabase 클라이언트 주입
│   │   ├── http/                      # HTTP 응답 유틸
│   │   │   └── response.ts            # success/failure 헬퍼
│   │   ├── supabase/                  # Supabase 설정
│   │   │   └── server-client.ts       # 서버 클라이언트
│   │   └── config/                    # 환경 변수 파싱
│   │       └── env.ts                 # Zod 기반 환경 변수
│   │
│   ├── features/                      # 기능별 모듈
│   │   ├── auth/                      # 인증
│   │   │   ├── backend/               # 백엔드 (route, service, schema)
│   │   │   ├── components/            # UI 컴포넌트
│   │   │   ├── hooks/                 # React Query 훅
│   │   │   ├── lib/                   # DTO, API 클라이언트
│   │   │   └── context/               # React Context
│   │   ├── campaigns/                 # 체험단
│   │   ├── applications/              # 지원 관리
│   │   └── onboarding/                # 온보딩
│   │
│   ├── components/                    # 공통 컴포넌트
│   │   ├── ui/                        # Shadcn UI 컴포넌트
│   │   └── layout/                    # 레이아웃 컴포넌트
│   │
│   ├── lib/                           # 유틸리티
│   │   ├── remote/                    # API 클라이언트
│   │   ├── supabase/                  # Supabase 클라이언트
│   │   ├── formatters/                # 포맷터
│   │   └── validators/                # Zod 스키마
│   │
│   └── constants/                     # 상수
│
├── supabase/                          # Supabase 설정
│   └── migrations/                    # SQL 마이그레이션 파일
│
└── docs/                              # 문서
    ├── prd.md                         # 제품 요구사항 문서
    ├── database.md                    # 데이터베이스 스키마
    └── userflow.md                    # 사용자 플로우
```

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Component Library**: Shadcn UI (Radix UI 기반)
- **State Management**:
  - React Query (서버 상태)
  - Zustand (전역 클라이언트 상태)
- **Form**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date**: date-fns
- **Utils**: es-toolkit, react-use, ts-pattern

### Backend
- **API Framework**: Hono 4
- **Runtime**: Next.js Route Handler (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **HTTP Client**: Axios

### DevOps & Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js + Turbopack

---

## 🏗 아키텍처

### Backend Layer (Hono + Next.js)

1. **Entry Point**: `src/app/api/[[...hono]]/route.ts`
   - Next.js Route Handler로 Hono 앱 위임
   - `runtime = 'nodejs'` (Supabase service-role 키 사용)

2. **Hono App**: `src/backend/hono/app.ts`
   - 싱글턴 패턴으로 앱 생성
   - 미들웨어 체인:
     ```
     errorBoundary → withAppContext → withSupabase → feature routes
     ```

3. **Feature Structure**:
   ```
   features/[feature]/backend/
   ├── route.ts      # Hono 라우터 정의
   ├── service.ts    # Supabase 비즈니스 로직
   ├── schema.ts     # Zod 요청/응답 스키마
   └── error.ts      # 에러 코드 정의
   ```

4. **Response Pattern**:
   ```typescript
   // 모든 서비스 함수는 HandlerResult 반환
   return success(data);           // 성공
   return failure(code, message);  // 실패
   ```

### Frontend Layer

1. **Client Components Only**: 모든 컴포넌트는 `"use client"`
2. **Server State**: React Query로 관리
3. **API Client**: Axios + Supabase Auth 인터셉터
4. **Type Safety**: 백엔드 스키마를 프론트엔드에서 재사용

---

## 📝 주요 기능 상세

### 1. 인증 시스템
- Supabase Auth 기반 이메일 인증
- 자동 세션 갱신 (axios interceptor)
- 보호된 라우트 (middleware)

### 2. 체험단 관리 (광고주)
- 체험단 등록/수정/삭제
- 지원자 목록 조회
- 선정/탈락 처리
- 모집 조기 종료
- 상태별 필터링 (모집중/진행중/완료)

### 3. 체험단 지원 (인플루언서)
- 체험단 탐색 (카테고리/지역 필터)
- 지원서 제출
- 내 지원 목록 조회
- 선정 결과 확인

### 4. 온보딩
- 역할 선택 (광고주/인플루언서)
- 프로필 정보 입력
- SNS 채널 등록 (인플루언서)

---

## 🔐 보안

- ✅ Supabase Row Level Security (RLS) 비활성화 (서버 측 검증)
- ✅ Service Role 키는 서버 측에서만 사용
- ✅ 인증 미들웨어로 엔드포인트 보호
- ✅ Zod 스키마로 입력 검증
- ✅ CORS 설정

---

## 📚 API 문서

주요 API 엔드포인트:

### Auth
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### Campaigns
- `GET /api/campaigns` - 체험단 목록
- `GET /api/campaigns/:id` - 체험단 상세
- `POST /api/campaigns` - 체험단 등록 (광고주)
- `PATCH /api/campaigns/:id` - 체험단 수정 (광고주)
- `DELETE /api/campaigns/:id` - 체험단 삭제 (광고주)
- `POST /api/campaigns/:id/close` - 모집 조기 종료 (광고주)
- `GET /api/my/campaigns` - 내 체험단 목록 (광고주)

### Applications
- `POST /api/campaigns/:id/apply` - 체험단 지원 (인플루언서)
- `GET /api/my/applications` - 내 지원 목록 (인플루언서)
- `GET /api/campaigns/:id/applicants` - 지원자 목록 (광고주)
- `PATCH /api/applications/:id/status` - 선정/탈락 처리 (광고주)

### Onboarding
- `POST /api/onboarding/advertiser` - 광고주 프로필 생성
- `POST /api/onboarding/influencer` - 인플루언서 프로필 생성
- `GET /api/onboarding/status` - 온보딩 상태 확인

---

## 🧪 개발 가이드

### 새 기능 추가

1. **백엔드 구현**:
   ```bash
   src/features/[feature]/backend/
   ├── route.ts      # 라우터 등록
   ├── service.ts    # 비즈니스 로직
   ├── schema.ts     # Zod 스키마
   └── error.ts      # 에러 코드
   ```

2. **프론트엔드 구현**:
   ```bash
   src/features/[feature]/
   ├── components/   # UI 컴포넌트
   ├── hooks/        # React Query 훅
   └── lib/          # API 클라이언트, DTO
   ```

3. **라우터 등록**:
   ```typescript
   // src/backend/hono/app.ts
   import { registerFeatureRoutes } from '@/features/[feature]/backend/route';

   registerFeatureRoutes(app);
   ```

### 코드 스타일

- **Early Returns**: 중첩 방지
- **Functional Programming**: 순수 함수, 불변성
- **Type Safety**: any 금지, 명시적 타입
- **Component Pattern**: 작고 재사용 가능한 컴포넌트

### Supabase 마이그레이션

새 테이블 추가 시:

```bash
# 1. 마이그레이션 파일 생성
supabase/migrations/[timestamp]_[description].sql

# 2. Supabase SQL Editor에서 실행
# 3. supabase/migrations/README.md 업데이트
```

---

## 🤝 기여 가이드

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 라이선스

This project is private and proprietary.

---

## 📞 지원

문제가 발생하면 GitHub Issues를 통해 제보해주세요.

---

## 🎯 로드맵

### Phase 1 (완료)
- ✅ 기본 인증 시스템
- ✅ 체험단 CRUD
- ✅ 지원 시스템
- ✅ 온보딩
- ✅ 선정/탈락 관리

### Phase 2 (진행 중)
- ⬜ 알림 시스템
- ⬜ 리뷰 작성 기능
- ⬜ 파일 업로드 (이미지)
- ⬜ 검색 개선
- ⬜ 페이지네이션 최적화

### Phase 3 (계획)
- ⬜ 관리자 대시보드
- ⬜ 통계 및 분석
- ⬜ 메시지 시스템
- ⬜ 결제 시스템
- ⬜ 모바일 앱

---

Built with ❤️ using Next.js and Supabase
