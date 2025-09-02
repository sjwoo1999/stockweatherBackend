# 🌤️ StockWeather Backend

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-EA2845?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)

</div>

## 📝 프로젝트 소개

StockWeather는 주식 시장과 날씨 정보를 결합한 실시간 데이터 분석 및 알림 서비스입니다. 
날씨 변화가 주식 시장에 미치는 영향을 분석하고, 실시간으로 중요한 정보를 제공합니다.

## 🎯 프로젝트 비전 및 목표

### 핵심 가치 제안
- **데이터 융합**: 주식과 날씨 데이터의 창의적 결합으로 새로운 투자 인사이트 제공
- **실시간성**: WebSocket 기반 즉시 알림으로 투자 기회를 놓치지 않도록 지원  
- **AI 인사이트**: OpenAI 기반 자연어 분석으로 복잡한 데이터를 이해하기 쉽게 해석
- **접근성**: 직관적인 UI/UX로 모든 레벨의 투자자가 활용 가능

### 타겟 사용자
- 개인 투자자 (주식 투자 경험 1년 이상)
- 펀드 매니저 및 자산 운용사
- 데이터 분석가 및 퀀트 트레이더
- 날씨 민감 산업 종사자 (농업, 에너지, 리테일 등)

### ✨ 주요 기능

#### 📊 실시간 주식 데이터 분석
- **실시간 시장 데이터 처리**: 한국 주식 시장 실시간 데이터 수집 및 처리
- **기술적 지표 분석**: 이동평균, RSI, MACD 등 주요 기술적 지표 계산
- **시장 동향 예측**: 과거 패턴 분석을 통한 단기 시장 동향 예측
- **종목 추천 시스템**: 데이터 기반 투자 종목 추천 및 매매 신호 생성

#### 🌤️ 날씨 기반 분석  
- **날씨-주식 상관관계 분석**: 기상 조건과 특정 섹터 주가의 상관관계 분석
- **계절적 패턴 분석**: 계절별 기후 변화가 농업, 에너지, 리테일 섹터에 미치는 영향
- **기상 이변 영향 예측**: 태풍, 한파, 폭염 등 극한 기상 현상의 시장 영향도 예측
- **지역별 날씨 데이터**: 전국 주요 지역의 실시간 날씨 정보 및 예보

#### 🤖 AI 기반 인사이트
- **OpenAI 시장 분석**: GPT 기반 뉴스 및 공시 정보 자연어 분석
- **자동화된 리포트 생성**: 일일/주간 시장 동향 및 투자 인사이트 자동 생성
- **패턴 인식**: 머신러닝을 통한 주가 패턴 및 이상 징후 탐지
- **감정 분석**: 뉴스, SNS 등의 시장 심리 분석

#### 🔔 실시간 알림 시스템
- **WebSocket 기반 실시간 통신**: 지연 없는 실시간 데이터 및 알림 전송
- **맞춤형 알림 설정**: 사용자별 관심 종목, 가격 변동률, 날씨 조건별 알림 설정
- **중요 이벤트 감지**: 급격한 주가 변동, 중요 공시, 기상 특보 등 실시간 감지 및 알림
- **멀티 채널 지원**: 웹, 모바일 앱을 통한 통합 알림 서비스

## 🛠 기술 스택 및 아키텍처

### 🎯 Backend Architecture
- **프레임워크**: NestJS 11.x (모듈러 아키텍처)
- **언어**: TypeScript 5.7.x (타입 안정성 및 개발 생산성)
- **데이터베이스**: PostgreSQL (관계형 데이터 저장)
- **ORM**: TypeORM (엔티티 기반 데이터 모델링)
- **실시간 통신**: Socket.IO 4.8.x (WebSocket 기반)
- **캐싱**: In-Memory 캐싱 (성능 최적화)

### 🔐 보안 및 인증
- **인증 시스템**: JWT (JSON Web Token)
- **소셜 로그인**: Kakao OAuth 2.0
- **쿠키 보안**: HttpOnly, Secure, SameSite 설정
- **CORS**: 크로스 오리진 요청 보안 처리

### 🤖 외부 API 연동
- **AI 분석**: OpenAI API (GPT 기반 자연어 처리)
- **주식 데이터**: 한국투자증권 KIS API
- **날씨 데이터**: 기상청 API, OpenWeather API
- **공시 정보**: 전자공시시스템 DART API

### ☁️ DevOps & 인프라
- **컨테이너화**: Docker (REST API / WebSocket 분리 배포)
- **클라우드**: Google Cloud Functions (서버리스)
- **CI/CD**: GitHub Actions (자동 빌드 및 배포)
- **모니터링**: 애플리케이션 로그 및 성능 모니터링

## 🏗 프로젝트 구조 및 모듈 설계

### 📁 디렉토리 구조
```
stockweather-backend/
├── src/
│   ├── main-rest.ts              # REST API 서버 진입점
│   ├── main-ws.ts               # WebSocket 서버 진입점
│   ├── bootstrap-rest-functions.ts # Google Cloud Functions 부트스트랩
│   ├── app.module.ts            # 루트 애플리케이션 모듈
│   │
│   ├── auth/                    # 🔐 인증 & 인가 모듈
│   │   ├── auth.controller.ts   # 인증 REST API (로그인, 로그아웃)
│   │   ├── auth.service.ts      # 인증 비즈니스 로직
│   │   ├── jwt.strategy.ts      # JWT 인증 전략
│   │   ├── kakao.strategy.ts    # Kakao OAuth 전략
│   │   └── jwt-auth.guard.ts    # JWT 인증 가드
│   │
│   ├── users/                   # 👥 사용자 관리 모듈
│   │   ├── users.controller.ts  # 사용자 CRUD API
│   │   ├── users.service.ts     # 사용자 비즈니스 로직
│   │   ├── user.entity.ts       # 사용자 데이터베이스 엔티티
│   │   └── user.interface.ts    # 사용자 타입 정의
│   │
│   ├── stock/                   # 📈 주식 데이터 처리 모듈
│   │   ├── stock.controller.ts  # 주식 데이터 API
│   │   ├── stock.service.ts     # 주식 데이터 수집 및 처리
│   │   ├── stock.module.ts      # 주식 모듈 설정
│   │   └── dto/                 # 주식 관련 DTO
│   │       └── stock-suggestion.dto.ts
│   │
│   ├── disclosure/              # 📋 공시 정보 처리 모듈
│   │   ├── disclosure.service.ts # 전자공시 데이터 수집
│   │   ├── disclosure.module.ts  # 공시 모듈 설정
│   │   └── interfaces/          # 공시 관련 타입 정의
│   │       └── disclosure-item.interface.ts
│   │
│   ├── ai-analysis/             # 🤖 AI 분석 모듈
│   │   ├── ai-analysis.service.ts # OpenAI API 연동 및 분석
│   │   └── ai-analysis.module.ts  # AI 분석 모듈 설정
│   │
│   ├── websocket/               # 🔄 실시간 통신 모듈
│   │   ├── websocket-emitter.service.ts # WebSocket 이벤트 발송
│   │   └── websocket.module.ts          # WebSocket 모듈 설정
│   │
│   ├── events/                  # ⚡ 이벤트 처리 모듈
│   │   ├── events.controller.ts # 이벤트 트리거 API
│   │   ├── events.gateway.ts    # WebSocket 게이트웨이
│   │   └── events.module.ts     # 이벤트 모듈 설정
│   │
│   ├── types/                   # 📝 타입 정의
│   │   ├── stock.ts            # 주식 관련 타입
│   │   ├── common.ts           # 공통 타입
│   │   ├── google-api.ts       # Google API 타입
│   │   └── naver-api.ts        # Naver API 타입
│   │
│   └── utils/                   # 🛠 유틸리티
│       └── database.ts          # 데이터베이스 설정
│
├── test/                        # 테스트 파일
├── dist/                        # 빌드 결과물
├── Dockerfile.rest             # REST API 서버 Docker 설정
├── Dockerfile.websocket        # WebSocket 서버 Docker 설정
└── package.json               # 프로젝트 의존성
```

### 🔧 모듈 간 의존성 관계
```
AppModule (루트)
├── AuthModule → UsersModule
├── StockModule → AI-AnalysisModule
├── DisclosureModule → AI-AnalysisModule  
├── EventsModule → WebSocketModule
└── WebSocketModule (독립적)
```

## 🚀 시작하기

### 💻 개발 환경 요구사항
- **Node.js**: v18.0.0 이상
- **PostgreSQL**: v14.0 이상
- **Docker**: v20.10 이상 (선택사항)
- **Git**: 최신 버전

### 📦 설치 및 실행

#### 1. 저장소 클론
```bash
git clone https://github.com/your-username/stockweather-backend.git
cd stockweather-backend
```

#### 2. 의존성 설치
```bash
npm install
```

#### 3. 환경 변수 설정
```bash
# 개발용 환경 파일 생성
cp .env.example .env.development
```

```env
# === 데이터베이스 설정 ===
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=stockweather

# === JWT 인증 설정 ===
JWT_SECRET=your_super_secret_jwt_key_here

# === Kakao OAuth 설정 ===
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback

# === OpenAI API 설정 ===
OPENAI_API_KEY=sk-your_openai_api_key_here

# === 외부 API 설정 ===
# 한국투자증권 KIS API
KIS_APP_KEY=your_kis_app_key
KIS_APP_SECRET=your_kis_app_secret

# 기상청 API
WEATHER_API_KEY=your_weather_api_key

# === WebSocket 설정 ===
WS_PORT=3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# === Google Cloud 설정 (배포용) ===
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

#### 4. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb stockweather

# TypeORM 마이그레이션 실행 (필요시)
npm run migration:run
```

#### 5. 서버 실행
```bash
# 🔥 개발 모드 (핫 리로드)
npm run start:dev

# 🌐 REST API 서버만 실행 (포트: 3000)
npm run start:rest

# 🔄 WebSocket 서버만 실행 (포트: 3001)  
npm run start:ws

# 🏭 프로덕션 모드
npm run start:prod:rest  # REST API
npm run start:prod:ws    # WebSocket
```

### 🐳 Docker를 이용한 실행

#### Docker Compose (권장)
```bash
# 전체 서비스 실행 (PostgreSQL + REST API + WebSocket)
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 개별 Docker 빌드 및 실행
```bash
# REST API 서버 빌드 및 실행
docker build -f Dockerfile.rest -t stockweather-rest .
docker run -p 3000:3000 --env-file .env.development stockweather-rest

# WebSocket 서버 빌드 및 실행
docker build -f Dockerfile.websocket -t stockweather-ws .
docker run -p 3001:3001 --env-file .env.development stockweather-ws
```

## 📚 API 문서 및 개발 가이드

### 📖 API 문서
- **Swagger UI**: [http://localhost:3000/api](http://localhost:3000/api)
- **REST API 기본 URL**: `http://localhost:3000`
- **WebSocket 연결**: `http://localhost:3001`

### 🔑 주요 API 엔드포인트
```bash
# 인증
POST /auth/login           # 일반 로그인
GET  /auth/kakao           # 카카오 로그인
POST /auth/logout          # 로그아웃

# 사용자 관리
GET  /users/profile        # 사용자 프로필 조회
PUT  /users/profile        # 사용자 프로필 업데이트

# 주식 데이터
GET  /stock/current        # 실시간 주식 데이터
GET  /stock/suggestions    # AI 기반 종목 추천
POST /stock/analyze        # 특정 종목 분석

# WebSocket 이벤트
/events/stock-update       # 실시간 주식 데이터 업데이트
/events/weather-alert      # 날씨 알림
/events/ai-insight         # AI 분석 결과
```

## 🧪 테스트 및 품질 관리

### 테스트 실행
```bash
# 🔍 단위 테스트
npm run test

# 🔄 테스트 파일 변경 감지 (개발용)
npm run test:watch

# 🏁 E2E 테스트 
npm run test:e2e

# 📊 테스트 커버리지 분석
npm run test:cov
```

### 코드 품질 관리
```bash
# 📏 ESLint 검사 및 자동 수정
npm run lint

# 🎨 Prettier 코드 포맷팅
npx prettier --write src/**/*.ts

# 🔍 TypeScript 타입 검사
npx tsc --noEmit
```

## ☁️ 배포 및 운영

### 🚀 Google Cloud Functions 배포
```bash
# 환경 변수 설정
export GOOGLE_CLOUD_PROJECT=your-project-id

# REST API 서버 배포
gcloud functions deploy stockweather-rest \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point bootstrapRestFunctions \
  --env-vars-file .env.production

# WebSocket 서버 배포  
gcloud functions deploy stockweather-ws \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point bootstrapWsFunctions \
  --env-vars-file .env.production
```

### 📊 모니터링 및 로그
```bash
# Google Cloud 함수 로그 조회
gcloud functions logs read stockweather-rest --limit 50

# 실시간 로그 스트리밍
gcloud functions logs tail stockweather-ws
```

## 🔄 최근 업데이트 및 버전 히스토리

### 최근 주요 변경사항 (2024년 6월)
- ✅ **보안 강화**: JWT 토큰을 URL 파라미터에서 쿠키 기반으로 변경
- ✅ **인증 개선**: Kakao 로그인 리다이렉트 URL을 `/dashboard`로 통일
- ✅ **안정성 향상**: WebSocket 서버의 JWT_SECRET 에러 처리 개선
- ✅ **헬스체크**: Express 기반 헬스체크 엔드포인트 추가
- ✅ **연결 안정성**: WebSocket 연결 안정성 및 소켓 ID 관리 개선
- ✅ **서버리스 최적화**: Google Cloud Functions 환경에서의 WebSocket 이벤트 처리 최적화

### 개발 로드맵 (2024년 하반기)
- 🎯 **실시간 알림 고도화**: 개인화된 알림 설정 및 필터링 기능
- 🎯 **AI 분석 확장**: 감정 분석 및 뉴스 기반 시장 예측 모델 추가  
- 🎯 **데이터 시각화**: 차트 및 대시보드 API 개발
- 🎯 **성능 최적화**: 캐싱 전략 및 데이터베이스 쿼리 최적화
- 🎯 **모바일 지원**: React Native 앱을 위한 API 확장

## 🤝 기여하기

### 개발 기여 가이드
1. **Fork** 본 레포지토리
2. **Feature Branch** 생성: `git checkout -b feature/amazing-feature`
3. **Commit** 변경사항: `git commit -m 'Add: amazing feature'`
4. **Push** 브랜치: `git push origin feature/amazing-feature`  
5. **Pull Request** 제출

### 커밋 메시지 컨벤션
```
Type: Subject (50자 이내)

Body (선택사항, 72자로 줄바꿈)

Footer (선택사항)
```

**Types**: `Add`, `Fix`, `Update`, `Remove`, `Docs`, `Style`, `Refactor`, `Test`

### 개발 환경 설정 지원
- 🐛 **이슈 제기**: 버그 리포트 및 기능 요청
- 💡 **아이디어 제안**: 새로운 기능 및 개선사항
- 📖 **문서 개선**: README, API 문서, 코드 주석
- 🧪 **테스트 추가**: 단위 테스트 및 E2E 테스트

## 📞 문의 및 지원

### 개발팀 연락처
- **이메일**: contact@stockweather.com
- **슬랙**: #stockweather-dev
- **이슈 트래커**: [GitHub Issues](https://github.com/your-username/stockweather-backend/issues)

### 커뮤니티
- **Discord**: [StockWeather 개발자 커뮤니티](https://discord.gg/stockweather)
- **카카오톡 오픈챗**: StockWeather 사용자 모임
- **정기 개발자 밋업**: 매월 셋째 주 토요일

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 배포됩니다.

## 🙏 감사의 글

### 오픈소스 라이브러리
- **NestJS** - 확장 가능한 Node.js 서버사이드 애플리케이션 구축
- **TypeORM** - TypeScript 기반 ORM
- **Socket.IO** - 실시간 양방향 통신
- **OpenAI** - AI 기반 자연어 처리
- **PostgreSQL** - 안정적인 관계형 데이터베이스

### 데이터 제공
- **한국투자증권** - KIS API를 통한 주식 데이터
- **기상청** - 날씨 데이터 및 기상 예보
- **전자공시시스템** - DART API를 통한 공시 정보

---

<div align="center">
  
### 🌤️ StockWeather - 데이터로 더 스마트한 투자를 🚀

<sub>Built with ❤️ by StockWeather Team</sub>

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요! ⭐**

</div>
