# StockWeather Backend

주식 시장과 날씨 정보를 결합한 실시간 데이터 분석 및 알림 서비스의 백엔드 시스템입니다.

## 기술 스택

- **프레임워크**: NestJS
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL
- **실시간 통신**: WebSocket (Socket.IO)
- **인증**: JWT, Kakao OAuth
- **AI 통합**: OpenAI
- **배포**: Docker, Google Cloud Functions

## 주요 기능

- 실시간 주식 시장 데이터 처리
- 날씨 정보와 주식 데이터 연계 분석
- AI 기반 시장 분석 및 예측
- 실시간 알림 시스템
- 사용자 인증 및 권한 관리
- 공시 정보 처리 및 분석

## 프로젝트 구조

```
src/
├── stock/          # 주식 관련 기능
├── websocket/      # 실시간 통신
├── disclosure/     # 공시 관련 기능
├── ai-analysis/    # AI 분석 기능
├── users/          # 사용자 관리
├── auth/           # 인증 관련
└── utils/          # 유틸리티 함수
```

## 시작하기

### 필수 조건

- Node.js (v18 이상)
- PostgreSQL
- Docker (선택사항)

### 설치

```bash
# 의존성 설치
npm install

# 개발 환경 설정
cp .env.example .env.development
```

### 환경 변수 설정

`.env.development` 파일에 다음 환경 변수들을 설정해주세요:

```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=stockweather
DB_SSL_ENABLED=false

# JWT
JWT_SECRET=your_jwt_secret

# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 실행

```bash
# 개발 모드
npm run start:dev

# REST API 서버
npm run start:rest

# WebSocket 서버
npm run start:ws

# 프로덕션 모드
npm run start:prod:rest  # REST API
npm run start:prod:ws    # WebSocket
```

### Docker로 실행

```bash
# REST API 서버
docker build -f Dockerfile.rest -t stockweather-rest .
docker run -p 3000:3000 stockweather-rest

# WebSocket 서버
docker build -f Dockerfile.websocket -t stockweather-ws .
docker run -p 3001:3001 stockweather-ws
```

## API 문서

API 문서는 Swagger를 통해 제공됩니다. 서버 실행 후 다음 URL에서 확인할 수 있습니다:

```
http://localhost:3000/api
```

## 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 배포

### Google Cloud Functions

```bash
# REST API 배포
gcloud functions deploy stockweather-rest \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point bootstrapRestFunctions

# WebSocket 배포
gcloud functions deploy stockweather-ws \
  --runtime nodejs18 \
  --trigger-http \
  --entry-point bootstrapWsFunctions
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
