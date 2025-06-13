# 🌤️ StockWeather Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-EA2845?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

</div>

## 📝 프로젝트 소개

StockWeather는 주식 시장과 날씨 정보를 결합한 실시간 데이터 분석 및 알림 서비스입니다. 
날씨 변화가 주식 시장에 미치는 영향을 분석하고, 실시간으로 중요한 정보를 제공합니다.

### ✨ 주요 기능

- 📊 **실시간 주식 데이터 분석**
  - 실시간 시장 데이터 처리
  - 기술적 지표 분석
  - 시장 동향 예측

- 🌤️ **날씨 기반 분석**
  - 날씨와 주식 상관관계 분석
  - 계절적 패턴 분석
  - 기상 이변에 따른 시장 영향 예측

- 🤖 **AI 기반 인사이트**
  - OpenAI를 활용한 시장 분석
  - 자연어 기반 리포트 생성
  - 패턴 인식 및 예측

- 🔔 **실시간 알림 시스템**
  - WebSocket 기반 실시간 업데이트
  - 중요 이벤트 알림
  - 맞춤형 알림 설정

## 🛠 기술 스택

### Backend
- **프레임워크**: NestJS
- **언어**: TypeScript
- **데이터베이스**: PostgreSQL
- **실시간 통신**: WebSocket (Socket.IO)
- **인증**: JWT, Kakao OAuth
- **AI**: OpenAI API

### DevOps
- **컨테이너화**: Docker
- **클라우드**: Google Cloud Functions
- **CI/CD**: GitHub Actions

## 🏗 프로젝트 구조

```
src/
├── stock/          # 주식 데이터 처리 및 분석
├── websocket/      # 실시간 통신 관리
├── disclosure/     # 공시 정보 처리
├── ai-analysis/    # AI 기반 분석
├── users/          # 사용자 관리
├── auth/           # 인증/인가
└── utils/          # 유틸리티
```

## 🚀 시작하기

### 필수 조건
- Node.js (v18+)
- PostgreSQL
- Docker (선택)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/stockweather-backend.git
cd stockweather-backend
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 설정**
```bash
cp .env.example .env.development
```

4. **환경 변수 설정**
```env
# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=stockweather

# 인증
JWT_SECRET=your_jwt_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# AI
OPENAI_API_KEY=your_openai_api_key
```

5. **서버 실행**
```bash
# 개발 모드
npm run start:dev

# REST API 서버
npm run start:rest

# WebSocket 서버
npm run start:ws
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

## 📚 API 문서

Swagger UI를 통해 API 문서를 확인할 수 있습니다:
```
http://localhost:3000/api
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## ☁️ 배포

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

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

<div align="center">
  <sub>Built with ❤️ by StockWeather Team</sub>
</div>
