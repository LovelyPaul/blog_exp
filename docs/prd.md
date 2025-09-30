# PRD: 블로그 체험단 플랫폼 SaaS

## 1. 제품 개요

### 1.1 제품 목적
본 제품은 광고주와 인플루언서를 연결하는 **체험단 매칭 SaaS 플랫폼**입니다.

### 1.2 핵심 가치 제안
- **광고주**: 효율적인 체험단 운영 도구
  - 간편한 체험단 모집/선정 관리
  - 지원자 검증 및 모니터링
  - 효과적인 캠페인 운영

- **인플루언서**: 간편한 참여 및 관리 경험
  - 쉽고 빠른 지원 프로세스
  - 실시간 진행 상태 확인
  - 다양한 체험 기회 발굴

### 1.3 핵심 기능
- 체험단 등록 및 모집 관리
- 인플루언서 지원 및 선정 프로세스
- 실시간 상태 추적 및 알림
- Supabase Auth 기반 회원관리 시스템

---

## 2. Stakeholders

### 2.1 Primary Stakeholders

#### 광고주 (Advertisers)
- **프로필**: 오프라인 매장 운영자, 브랜드 운영자, 중소기업 마케터
- **목표**: 브랜드 인지도 상승 및 매출 증대
- **Pain Points**:
  - 체험단 모집/관리의 복잡성
  - 적합한 인플루언서 발굴의 어려움
  - 지원자 검증 및 선정 과정의 비효율
- **Success Metrics**:
  - 체험단 등록 소요 시간
  - 지원자 수 및 품질
  - 캠페인 완료율

#### 인플루언서 (Influencers)
- **프로필**: 블로거, 유튜버, Instagram/Threads 등 SNS 채널 운영자
- **목표**: 다양한 체험 기회 확보 및 콘텐츠 소재 확보
- **Pain Points**:
  - 체험단 정보 파편화
  - 지원 프로세스의 복잡성
  - 선정 결과 및 진행 상태 파악 어려움
- **Success Metrics**:
  - 체험단 발견 및 지원 소요 시간
  - 선정률
  - 플랫폼 재방문율

### 2.2 Secondary Stakeholders

#### 플랫폼 운영자
- **역할**: 플랫폼 관리, 품질 관리, 분쟁 조정
- **책임**:
  - 사용자 인증 및 검증
  - 부적절한 콘텐츠/사용자 관리
  - 시스템 안정성 유지

#### 기술팀
- **역할**: 개발, 유지보수, 인프라 관리
- **책임**:
  - 기능 개발 및 배포
  - 성능 최적화
  - 보안 관리

---

## 3. 타겟 유저 Segments

### 3.1 광고주 (Advertisers)

#### Segment A: 소규모 로컬 비즈니스
- **특성**: 카페, 음식점, 뷰티샵 등 오프라인 매장
- **니즈**: 지역 기반 인플루언서 매칭, 간단한 운영
- **제공 혜택**: 무료 제품/서비스 제공

#### Segment B: 중소 브랜드/온라인 쇼핑몰
- **특성**: 제품 판매 비즈니스, 온라인 중심
- **니즈**: 전국 단위 인플루언서 매칭, 다양한 채널 활용
- **제공 혜택**: 제품 제공 + 소정의 리워드

### 3.2 인플루언서 (Influencers)

#### Segment A: 신규 인플루언서
- **특성**: 팔로워 1,000 ~ 10,000명, 포트폴리오 구축 단계
- **니즈**: 다양한 체험 기회, 콘텐츠 소재 확보
- **행동 패턴**: 활발한 지원, 높은 참여율

#### Segment B: 중급 인플루언서
- **특성**: 팔로워 10,000 ~ 100,000명, 안정적 채널 운영
- **니즈**: 브랜드 협업 기회, 수익 창출
- **행동 패턴**: 선택적 지원, 브랜드 적합도 중시

#### Segment C: 파워 인플루언서
- **특성**: 팔로워 100,000명 이상, 전문 크리에이터
- **니즈**: 프리미엄 협업, 장기 파트너십
- **행동 패턴**: 매우 선택적, 계약 조건 협상

---

## 4. 포함 페이지

### 4.1 공통 페이지

#### P1. 홈 (Home)
- **경로**: `/`
- **접근 권한**: 전체 (비로그인 포함)
- **주요 요소**:
  - 상단 히어로 배너 (공지/추천 체험단)
  - 모집 중인 체험단 리스트 (카드 그리드)
  - 정렬 옵션: 최신순, 마감임박순, 인기순
  - 필터: 카테고리, 지역, 혜택 유형
- **CTA**:
  - 비로그인: "로그인하고 지원하기"
  - 인플루언서: "체험단 둘러보기"
  - 광고주: "체험단 등록하기"

#### P2. 로그인/회원가입
- **경로**: `/auth/signin`, `/auth/signup`
- **접근 권한**: 비로그인 사용자
- **주요 요소**:
  - 이메일/소셜 로그인 (Supabase Auth)
  - 회원가입 시 역할 선택 (광고주/인플루언서)
  - 약관 동의 체크박스

#### P3. 온보딩
- **경로**: `/onboarding`
- **접근 권한**: 신규 가입 사용자
- **공통 입력**:
  - 이름 (필수)
  - 휴대폰번호 (필수, 인증)
  - 이메일 (필수)
  - 약관 동의 (필수)
- **광고주 추가 입력**:
  - 업체명 (필수)
  - 위치/주소 (필수)
  - 업종 카테고리 (필수)
  - 사업자등록번호 (필수)
  - 대표자명 (선택)
- **인플루언서 추가 입력**:
  - 생년월일 (필수)
  - SNS 채널 정보 (최소 1개 필수)
    - 네이버 블로그 (채널명, URL)
    - YouTube (채널명, URL)
    - Instagram (계정명, URL)
    - Threads (계정명, URL)
  - 주요 활동 카테고리 (선택)

#### P4. 체험단 상세 페이지
- **경로**: `/campaigns/:id`
- **접근 권한**: 전체 (비로그인 포함)
- **주요 섹션**:
  - 체험단 헤더 (제목, 썸네일, 모집 상태)
  - 모집 정보
    - 모집 기간 (시작일 ~ 종료일)
    - 모집 인원
    - 현재 지원자 수
  - 제공 혜택 (상세 설명)
  - 미션 요구사항
  - 매장/브랜드 정보
    - 위치 (지도 표시)
    - 영업시간
    - 연락처
  - 유의사항
- **CTA**:
  - 비로그인: "로그인하고 지원하기"
  - 로그인 + 온보딩 완료: "지원하기" 버튼
  - 이미 지원한 경우: "지원 완료" (비활성)
  - 광고주 본인: "지원자 관리" 버튼

### 4.2 인플루언서 전용 페이지

#### P5. 체험단 지원 페이지
- **경로**: `/campaigns/:id/apply`
- **접근 권한**: 인플루언서 (온보딩 완료)
- **주요 요소**:
  - 체험단 요약 정보
  - 지원 폼
    - 각오 한마디 (텍스트 영역, 필수, 최대 500자)
    - 방문 예정일자 (날짜 선택, 필수)
    - SNS 채널 선택 (내 등록된 채널 중 선택)
  - 제출 버튼
- **제출 후**: `/my/applications`로 리다이렉트

#### P6. 내 지원 목록
- **경로**: `/my/applications`
- **접근 권한**: 인플루언서
- **주요 요소**:
  - 상태별 탭/필터
    - 전체
    - 신청완료 (대기 중)
    - 선정됨
    - 반려됨
  - 지원 내역 카드 리스트
    - 체험단 썸네일 및 제목
    - 지원 날짜
    - 현재 상태 배지
    - 방문 예정일
  - 각 카드 클릭 시: 체험단 상세 페이지로 이동

### 4.3 광고주 전용 페이지

#### P7. 체험단 관리 (대시보드)
- **경로**: `/advertiser/campaigns`
- **접근 권한**: 광고주
- **주요 요소**:
  - 상단 통계 카드
    - 총 체험단 수
    - 진행 중인 체험단
    - 총 지원자 수
  - 체험단 목록 (테이블 또는 카드 뷰)
    - 체험단명
    - 상태 (모집중, 모집종료, 선정완료, 종료)
    - 모집기간
    - 지원자 수 / 모집 인원
    - 액션 버튼 (상세보기, 수정, 삭제)
  - "새 체험단 등록" 버튼 (상단 우측)

#### P8. 체험단 등록/수정
- **경로**: `/advertiser/campaigns/new`, `/advertiser/campaigns/:id/edit`
- **접근 권한**: 광고주
- **폼 방식**: Dialog 또는 전체 페이지
- **필수 입력**:
  - 체험단명 (텍스트, 최대 100자)
  - 모집 기간 (시작일 ~ 종료일)
  - 모집 인원 (숫자)
  - 제공 혜택 (리치 텍스트 에디터)
  - 미션 (리치 텍스트 에디터)
  - 매장 정보
    - 매장명
    - 주소 (주소 검색 API)
    - 연락처
    - 영업시간
  - 카테고리 (선택)
  - 썸네일 이미지 (업로드)
- **선택 입력**:
  - 유의사항
  - 추가 이미지 (최대 5장)

#### P9. 광고주용 체험단 상세 (지원자 관리)
- **경로**: `/advertiser/campaigns/:id`
- **접근 권한**: 광고주 (본인 체험단)
- **주요 섹션**:
  - 체험단 정보 요약
  - 상태별 액션 버튼
    - **모집중**: "모집 종료" 버튼
    - **모집종료**: "체험단 선정" 버튼
    - **선정완료**: 선정된 인플루언서 목록 표시
  - 지원자 리스트 (테이블)
    - 인플루언서 정보
      - 이름
      - SNS 채널 (링크)
      - 팔로워 수 (옵션)
    - 지원 정보
      - 각오 한마디
      - 방문 예정일
      - 지원 날짜
    - 상태 (대기중, 선정, 반려)
    - 액션 (선정 체크박스 - 모집종료 상태일 때만)
  - 페이지네이션

#### P10. 체험단 선정 Dialog
- **트리거**: "체험단 선정" 버튼 클릭
- **주요 요소**:
  - 선택된 인플루언서 목록 (체크박스로 선택)
  - 모집 인원 대비 선택 인원 표시
  - 확인 버튼
- **제출 후**:
  - 선정된 사용자에게 알림 발송
  - 상태 "선정완료"로 변경
  - 지원자 테이블에서 선정/반려 상태 업데이트

---

## 5. 사용자 여정 (User Journey)

### 5.1 인플루언서 여정

#### Journey 1: 회원가입 및 첫 체험단 지원

**Goal**: 새로운 인플루언서가 플랫폼에 가입하고 첫 체험단에 지원

**Steps**:
1. **랜딩** (`/`)
   - 홈페이지에서 체험단 둘러보기
   - "회원가입" 클릭

2. **회원가입** (`/auth/signup`)
   - 이메일 또는 소셜 로그인
   - "인플루언서" 역할 선택

3. **온보딩** (`/onboarding`)
   - 기본 정보 입력 (이름, 휴대폰번호, 이메일)
   - SNS 채널 정보 등록
     - 네이버 블로그, YouTube, Instagram 중 최소 1개
   - 생년월일 입력
   - 약관 동의
   - "완료" 버튼 클릭

4. **홈 복귀** (`/`)
   - 모집 중인 체험단 리스트 확인
   - 관심 체험단 카드 클릭

5. **체험단 상세** (`/campaigns/:id`)
   - 모집 조건, 혜택, 미션 확인
   - 매장 위치 확인
   - "지원하기" 버튼 클릭

6. **지원 페이지** (`/campaigns/:id/apply`)
   - 각오 한마디 작성 (최대 500자)
   - 방문 예정일자 선택
   - 활동할 SNS 채널 선택
   - "제출" 버튼 클릭

7. **지원 완료** (`/my/applications`)
   - 지원 목록에서 "신청완료" 상태 확인
   - 선정 결과 대기

**Touchpoints**:
- 페이지: 홈 → 회원가입 → 온보딩 → 홈 → 체험단 상세 → 지원 페이지 → 내 지원 목록
- 사용자 감정: 기대 → 신뢰 → 집중 → 관심 → 결정 → 만족

#### Journey 2: 선정 결과 확인 및 체험단 참여

**Goal**: 지원한 체험단의 선정 결과를 확인하고 미션 수행

**Steps**:
1. **알림 수신**
   - 이메일/앱 푸시: "체험단에 선정되었습니다"

2. **내 지원 목록** (`/my/applications`)
   - "선정됨" 탭 클릭
   - 선정된 체험단 카드 확인

3. **체험단 상세** (`/campaigns/:id`)
   - 미션 재확인
   - 매장 정보 및 방문 예정일 확인

4. **오프라인 방문**
   - 매장 방문 및 체험

5. **콘텐츠 제작 및 업로드** (외부)
   - 블로그/SNS에 리뷰 콘텐츠 업로드
   - (향후 기능: 플랫폼 내 인증 제출)

**Touchpoints**:
- 페이지: 내 지원 목록 → 체험단 상세
- 사용자 감정: 기쁨 → 동기부여 → 성취

### 5.2 광고주 여정

#### Journey 3: 회원가입 및 첫 체험단 등록

**Goal**: 새로운 광고주가 플랫폼에 가입하고 첫 체험단을 등록

**Steps**:
1. **랜딩** (`/`)
   - "광고주 시작하기" 클릭

2. **회원가입** (`/auth/signup`)
   - 이메일 또는 소셜 로그인
   - "광고주" 역할 선택

3. **온보딩** (`/onboarding`)
   - 기본 정보 입력 (이름, 휴대폰번호, 이메일)
   - 사업자 정보 입력
     - 업체명
     - 위치/주소
     - 업종 카테고리
     - 사업자등록번호
   - 약관 동의
   - "완료" 버튼 클릭

4. **체험단 관리 페이지** (`/advertiser/campaigns`)
   - 빈 상태 화면: "첫 체험단을 등록해보세요"
   - "새 체험단 등록" 버튼 클릭

5. **체험단 등록 Dialog** (`/advertiser/campaigns/new`)
   - 필수 정보 입력
     - 체험단명
     - 모집 기간 (시작일 ~ 종료일)
     - 모집 인원
     - 제공 혜택
     - 미션
     - 매장 정보 (주소, 연락처, 영업시간)
     - 썸네일 이미지 업로드
   - "등록" 버튼 클릭

6. **등록 완료** (`/advertiser/campaigns`)
   - 체험단 목록에서 새로 등록된 체험단 확인
   - 상태: "모집중"

**Touchpoints**:
- 페이지: 홈 → 회원가입 → 온보딩 → 체험단 관리 → 체험단 등록 → 체험단 관리
- 사용자 감정: 관심 → 신뢰 → 집중 → 기대 → 만족

#### Journey 4: 지원자 관리 및 선정

**Goal**: 모집 종료 후 적합한 인플루언서를 선정

**Steps**:
1. **체험단 관리 페이지** (`/advertiser/campaigns`)
   - 등록한 체험단 목록 확인
   - 지원자 수 확인 (예: 25명 지원 / 10명 모집)

2. **체험단 상세** (`/advertiser/campaigns/:id`)
   - 지원자 리스트 테이블 확인
   - 각 지원자의 프로필 검토
     - SNS 채널 링크 클릭 (새 탭)
     - 각오 한마디 및 방문 예정일 확인
   - 모집 기간 종료 전: 계속 모니터링

3. **모집 종료** (`/advertiser/campaigns/:id`)
   - 모집 기간 종료 또는 수동 "모집 종료" 버튼 클릭
   - 상태: "모집중" → "모집종료"

4. **체험단 선정** (`/advertiser/campaigns/:id`)
   - "체험단 선정" 버튼 클릭
   - 선정 Dialog 오픈
   - 지원자 중 선정할 인플루언서 체크박스 선택 (10명)
   - "선정 완료" 버튼 클릭

5. **선정 완료** (`/advertiser/campaigns/:id`)
   - 상태: "모집종료" → "선정완료"
   - 선정된 인플루언서 목록 표시
   - 선정되지 않은 지원자는 "반려" 상태로 자동 업데이트

6. **체험단 진행**
   - 선정된 인플루언서와 개별 연락 (플랫폼 외부)
   - 매장 방문 및 체험 진행
   - (향후 기능: 인증 확인 및 리뷰 수집)

**Touchpoints**:
- 페이지: 체험단 관리 → 체험단 상세 (반복) → 체험단 상세 (선정)
- 사용자 감정: 기대 → 분석 → 결정 → 만족

---

## 6. Information Architecture (IA)

```
Root (/)
│
├── Home (/)
│   ├── Hero Banner
│   ├── Campaign List (Cards)
│   └── Footer
│
├── Authentication
│   ├── Sign In (/auth/signin)
│   ├── Sign Up (/auth/signup)
│   └── Onboarding (/onboarding)
│       ├── Common Fields
│       ├── Advertiser Fields
│       └── Influencer Fields
│
├── Campaigns (Public)
│   ├── Campaign List (/) [filtered]
│   └── Campaign Detail (/campaigns/:id)
│       ├── Campaign Info
│       ├── Store Info
│       └── CTA (Apply / Login)
│
├── Influencer Dashboard (/my)
│   ├── My Applications (/my/applications)
│   │   ├── All
│   │   ├── Pending
│   │   ├── Selected
│   │   └── Rejected
│   │
│   └── Apply to Campaign (/campaigns/:id/apply)
│       ├── Application Form
│       └── Submit
│
└── Advertiser Dashboard (/advertiser)
    ├── Campaign Management (/advertiser/campaigns)
    │   ├── Campaign List (Table/Cards)
    │   ├── Statistics
    │   └── Create Campaign Button
    │
    ├── Create/Edit Campaign
    │   ├── New (/advertiser/campaigns/new)
    │   └── Edit (/advertiser/campaigns/:id/edit)
    │
    └── Campaign Detail (Advertiser) (/advertiser/campaigns/:id)
        ├── Campaign Info
        ├── Applicant List (Table)
        ├── Status Actions
        │   ├── End Recruitment (if recruiting)
        │   └── Select Winners (if recruitment ended)
        └── Selection Dialog
            ├── Applicant Selection (Checkboxes)
            └── Confirm Selection
```

### IA Tree Visualization (PlantUML)

```plantuml
@startwml
skinparam backgroundColor white
skinparam rectangleBackgroundColor #f0f0f0
skinparam rectangleBorderColor #333333

rectangle "Root (/)" as root {
  rectangle "🏠 Home\n(/)" as home

  rectangle "🔐 Auth" as auth {
    rectangle "Sign In\n(/auth/signin)" as signin
    rectangle "Sign Up\n(/auth/signup)" as signup
    rectangle "Onboarding\n(/onboarding)" as onboard
  }

  rectangle "📋 Campaigns (Public)" as campaigns {
    rectangle "Campaign List\n(/ filtered)" as list
    rectangle "Campaign Detail\n(/campaigns/:id)" as detail
  }

  rectangle "👤 Influencer\n(/my)" as influencer {
    rectangle "My Applications\n(/my/applications)" as myapps {
      rectangle "All" as all
      rectangle "Pending" as pending
      rectangle "Selected" as selected
      rectangle "Rejected" as rejected
    }
    rectangle "Apply\n(/campaigns/:id/apply)" as apply
  }

  rectangle "🏢 Advertiser\n(/advertiser)" as advertiser {
    rectangle "Campaign Mgmt\n(/advertiser/campaigns)" as mgmt {
      rectangle "Statistics" as stats
      rectangle "Campaign List" as advlist
    }
    rectangle "Create/Edit" as createedit {
      rectangle "New\n(/advertiser/campaigns/new)" as new
      rectangle "Edit\n(/advertiser/campaigns/:id/edit)" as edit
    }
    rectangle "Campaign Detail (Adv)\n(/advertiser/campaigns/:id)" as advdetail {
      rectangle "Applicant List" as applicants
      rectangle "Status Actions" as actions
      rectangle "Selection Dialog" as selection
    }
  }
}

root -down-> home
root -down-> auth
root -down-> campaigns
root -down-> influencer
root -down-> advertiser

auth -down-> signin
auth -down-> signup
auth -down-> onboard

campaigns -down-> list
campaigns -down-> detail

influencer -down-> myapps
influencer -down-> apply
myapps -down-> all
myapps -down-> pending
myapps -down-> selected
myapps -down-> rejected

advertiser -down-> mgmt
advertiser -down-> createedit
advertiser -down-> advdetail

mgmt -down-> stats
mgmt -down-> advlist

createedit -down-> new
createedit -down-> edit

advdetail -down-> applicants
advdetail -down-> actions
advdetail -down-> selection

@endwml
```

### 페이지 계층 구조 (Hierarchy)

**Level 0: Root**
- `/` - Home

**Level 1: Main Sections**
- `/auth/*` - Authentication
- `/campaigns/*` - Public Campaigns
- `/my/*` - Influencer Dashboard
- `/advertiser/*` - Advertiser Dashboard

**Level 2: Feature Pages**
- Auth:
  - `/auth/signin` - Sign In
  - `/auth/signup` - Sign Up
  - `/onboarding` - Onboarding

- Campaigns:
  - `/campaigns/:id` - Campaign Detail

- Influencer:
  - `/my/applications` - My Applications
  - `/campaigns/:id/apply` - Apply to Campaign

- Advertiser:
  - `/advertiser/campaigns` - Campaign Management
  - `/advertiser/campaigns/new` - Create Campaign
  - `/advertiser/campaigns/:id` - Campaign Detail (Advertiser View)
  - `/advertiser/campaigns/:id/edit` - Edit Campaign

**Level 3: Nested Features**
- Selection Dialog (Modal, triggered from `/advertiser/campaigns/:id`)

---

## 7. 주요 사용자 플로우

### 7.1 인플루언서 메인 플로우

```
[Landing] → [Sign Up] → [Onboarding] → [Home]
    ↓
[Browse Campaigns] → [Campaign Detail] → [Apply]
    ↓
[My Applications] → [Check Status] → [Selected/Rejected]
```

### 7.2 광고주 메인 플로우

```
[Landing] → [Sign Up] → [Onboarding] → [Campaign Management]
    ↓
[Create Campaign] → [Submit] → [Campaign Management]
    ↓
[View Applications] → [Review Applicants] → [End Recruitment]
    ↓
[Select Winners] → [Confirm Selection] → [Campaign Complete]
```

---

## 8. 기술 요구사항

### 8.1 인증 및 권한
- **Supabase Auth** 사용
- 역할 기반 접근 제어 (RBAC)
  - `role`: `influencer` | `advertiser`
- Row Level Security (RLS) 적용

### 8.2 데이터 모델 (간략)

**users**
- id (uuid, PK)
- email
- role (enum: influencer, advertiser)
- created_at

**influencer_profiles**
- id (uuid, PK)
- user_id (FK → users)
- name
- phone
- birth_date
- sns_channels (jsonb)

**advertiser_profiles**
- id (uuid, PK)
- user_id (FK → users)
- business_name
- business_number
- address
- category

**campaigns**
- id (uuid, PK)
- advertiser_id (FK → users)
- title
- description
- start_date, end_date
- max_applicants
- benefits (text)
- missions (text)
- store_info (jsonb)
- status (enum: recruiting, ended, completed)

**applications**
- id (uuid, PK)
- campaign_id (FK → campaigns)
- influencer_id (FK → users)
- message (text)
- visit_date (date)
- status (enum: pending, selected, rejected)
- created_at

### 8.3 UI/UX 요구사항
- 반응형 디자인 (모바일 우선)
- 접근성 준수 (WCAG 2.1 AA)
- shadcn/ui 컴포넌트 활용
- Tailwind CSS 스타일링

---

## 9. 성공 지표 (Success Metrics)

### 9.1 사용자 획득
- 월간 신규 가입자 수 (MAU)
- 광고주 : 인플루언서 비율 (목표: 1:10)

### 9.2 참여도
- 인플루언서 평균 지원 횟수
- 광고주 평균 체험단 등록 수
- 체험단당 평균 지원자 수

### 9.3 전환율
- 회원가입 → 온보딩 완료율
- 체험단 조회 → 지원 전환율
- 지원자 중 선정 비율

### 9.4 만족도
- NPS (Net Promoter Score)
- 재방문율 (7일, 30일)
- 체험단 완료율

---

## 10. 향후 로드맵

### Phase 1: MVP (현재 PRD)
- 기본 인증 및 온보딩
- 체험단 등록/지원/선정
- 상태 추적

### Phase 2: Enhancement
- 인증 제출 기능 (인플루언서 → 광고주)
- 리뷰 수집 및 리포트 생성
- 인앱 메시징
- 알림 시스템 (이메일, 푸시)

### Phase 3: Advanced Features
- AI 기반 매칭 추천
- 결제 시스템 (프리미엄 플랜)
- 분석 대시보드 (광고주용)
- 포트폴리오 페이지 (인플루언서용)

### Phase 4: Scale
- API 오픈 (파트너사 연동)
- 모바일 앱 출시
- 다국어 지원

---

## 11. 리스크 및 대응 방안

### 11.1 사용자 획득 리스크
- **리스크**: 초기 광고주/인플루언서 Chicken-Egg 문제
- **대응**:
  - 파일럿 파트너십 (지역 카페/음식점 10개)
  - 인플루언서 초기 리크루팅 (100명 목표)

### 11.2 품질 관리 리스크
- **리스크**: 저품질 지원자, 허위 정보
- **대응**:
  - SNS 채널 검증 (팔로워 수 확인)
  - 신고 시스템 구축
  - 광고주 평가 시스템

### 11.3 기술적 리스크
- **리스크**: Supabase 의존도, 스케일링 이슈
- **대응**:
  - Database 인덱싱 최적화
  - CDN 활용 (이미지 최적화)
  - 캐싱 전략 (React Query)

---

## 부록: 용어 정의

- **체험단**: 광고주가 등록한 체험/홍보 캠페인
- **지원**: 인플루언서가 체험단에 참여 신청
- **선정**: 광고주가 지원자 중 참여자 확정
- **미션**: 인플루언서가 수행해야 할 리뷰/홍보 활동
- **온보딩**: 회원가입 후 추가 정보 입력 프로세스