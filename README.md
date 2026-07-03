# FinMate 모바일 웹/PWA 앱 (독립 실행용 사본)

React + Vite 기반의 FinMate 모바일 웹/PWA 앱입니다. 사용자는 회원가입/로그인 후 30초 설문, 개인정보 공개 동의, 마이데이터 제공 동의를 거쳐 홈, 비교, 미션, 기록, 프로필, 친구 피드, 생일펀드, 포인트 지갑 흐름을 사용할 수 있습니다.

이 폴더는 `finmate` 레포의 `apps/web`에서 분리된 독립 실행용 사본입니다. 이 폴더만 단독으로 clone/배포해도 동작하도록 경로를 정리했습니다. 백엔드(API)는 별도로 실행 중이어야 합니다.

## 로컬 개발 실행

```bash
npm ci
cp .env.example .env   # 필요하면 VITE_API_BASE_URL 수정
npm run dev -- --host 0.0.0.0
```

기본 API 주소는 `http://localhost:8080`입니다. 백엔드가 다른 주소에서 돈다면 `.env`의 `VITE_API_BASE_URL`을 바꾸거나 아래처럼 실행합니다.

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

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
npm run lint --prefix apps/web
npm run build --prefix apps/web
npm run e2e --prefix apps/web
python3 tools/scripts/validate_product_mvp.py
```

E2E는 `http://localhost:5174`와 `http://localhost:8080`이 실행 중이라고 가정합니다. 다른 주소를 사용할 때는 `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_API_URL`을 설정합니다.

PWA manifest는 `public/manifest.webmanifest`, 기본 service worker는 `public/sw.js`에 있습니다. Docker web은 Vite production build를 nginx로 서빙합니다.

## 스크린샷

대표 화면 캡처는 `docs/assets/screenshots/`에서 확인합니다.

- `signup.png`
- `onboarding-survey.png`
- `onboarding-consent.png`
- `home.png`
- `compare.png`
- `coach.png`
- `mission.png`
- `records.png`
- `profile.png`
