# FinMate Frontend

React + Vite 기반의 FinMate 모바일 웹/PWA 앱입니다. 사용자는 회원가입/로그인 후 30초 설문, 개인정보 공개 동의, 마이데이터 제공 동의를 거쳐 홈, 비교, 미션, 기록, 프로필, 친구 피드, 생일펀드, 포인트 지갑 흐름을 사용할 수 있습니다.

이 레포가 FinMate의 **active product frontend source of truth**입니다. 백엔드, DB, synthetic dataset, API contract 검증은 [`gaga-studio/finmate`](https://github.com/gaga-studio/finmate)에서 관리합니다.

`gaga-studio/finmate/apps/web`는 당분간 legacy compatibility copy로 남겨 둡니다. 새 UX, 화면 설계, PWA/Capacitor 작업은 이 레포에서 진행합니다.

## 로컬 개발 실행

```bash
npm ci
cp .env.example .env   # 필요하면 VITE_API_BASE_URL 수정
npm run dev -- --host 0.0.0.0
```

기본값은 `VITE_DUMMY_MODE=true`라서 백엔드 없이 mock data로 화면을 확인할 수 있습니다.

실제 백엔드와 연결할 때는 `gaga-studio/finmate`에서 API 서버와 Postgres를 실행하고 synthetic dataset을 복구한 뒤 `.env`를 아래처럼 바꿉니다.

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_DUMMY_MODE=false
```

백엔드 CORS는 standalone frontend 개발 서버 기본 포트인 `5174`도 허용하도록 `gaga-studio/finmate`에서 관리합니다.

## Docker 실행 (이 폴더 단독)

```bash
docker build -t finmate-frontend --build-arg VITE_API_BASE_URL=http://localhost:8080 .
docker run -p 5174:80 finmate-frontend
```

`VITE_API_BASE_URL`은 빌드 타임에 번들에 굳어지는 값입니다(Vite 환경변수 특성). 백엔드 주소가 바뀌면 `docker run`이 아니라 `docker build --build-arg`를 다시 해야 반영됩니다.

## 테스트 계정

```text
p001@synthetic.finmate.local / password123!
```

이 계정은 백엔드(finmate API + Postgres)에 synthetic 데이터가 import되어 있어야 로그인됩니다. 백엔드 쪽 reset/import는 원본 레포의 `tools/scripts/`를 참고하세요.

## 주요 흐름

```text
/signup
/login
/onboarding
/home
/compare
/compare/filter
/compare/results/:comparisonId
/compare/coach
/missions
/missions/:missionId
/missions/add
/records
/records/:date
/profile
/profile/:section
/birthdays
/birthdays/:birthdayId
/birthday-funds/:fundId/contribute
/birthday-funds/:fundId/complete
```

## 검증

```bash
npm ci
npm run lint
npm run build
```

E2E는 프론트 dev server와, 실제 API mode라면 백엔드가 실행 중이라고 가정합니다. 다른 주소를 사용할 때는 `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_API_URL`을 설정합니다.

```bash
npm run dev -- --host 0.0.0.0
PLAYWRIGHT_BASE_URL=http://localhost:5174 npm run e2e
```

전체 product contract, synthetic import, API 테스트는 `gaga-studio/finmate`에서 실행합니다.

PWA manifest는 `public/manifest.webmanifest`, 기본 service worker는 `public/sw.js`에 있습니다. Docker web은 Vite production build를 nginx로 서빙합니다.

## 레포 역할

- `gaga-studio/finmate-frontend`: active frontend, Vite/React/PWA/Capacitor, UI/UX work.
- `gaga-studio/finmate`: backend API, DB schema, synthetic dataset import, contract validation.
- `gaga-studio/finmate/apps/web`: legacy compatibility copy. Do not start new product UI work there unless it is needed for contract compatibility.

## 환경 파일 정책

`.env`는 local-only 파일이며 git에 커밋하지 않습니다. 새 환경 변수가 필요하면 `.env.example`에 안전한 예시와 설명을 먼저 추가합니다.
