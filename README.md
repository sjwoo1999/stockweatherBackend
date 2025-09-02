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

> **"1초만에 확인하는 투자 전망"**

StockWeather는 개인 투자자를 위한 혁신적인 **투자 정보 요약 및 분석 SaaS 플랫폼**입니다. 복잡한 투자 데이터를 직관적인 날씨 시각화로 표현하여, 누구나 쉽고 빠르게 투자 전망을 파악할 수 있도록 합니다.

### 🎯 해결하고자 하는 문제

현대의 개인 투자자들이 직면한 핵심 문제점들을 해결합니다:

#### 📊 정보 과부하 문제
- **현상**: 개인이 소화하기 힘들 정도로 많은 투자 정보 홍수
- **결과**: 정보 선별의 어려움과 의사결정 지연

#### ⚠️ 신뢰도 문제  
- **현상**: 사설 토론방, 종목 추천방, 자극적인 유튜브 채널 난립
- **결과**: 신뢰할 수 있는 정보와 선동적 정보의 구분 어려움

#### 🧠 분석 역량의 한계
- **현상**: 고도화된 금융 상품과 복잡한 경제 환경
- **결과**: 전업 투자자가 아닌 개인의 체계적 분석 한계

#### 💸 투자 실패 위험 증가
- **현상**: 비전문적 정보 의존과 주관적 판단
- **결과**: 비체계적 위험 증가와 손실 확률 상승

### 💡 우리의 솔루션

**"개인 포트폴리오에 필요한 핵심 정보만 수집, 요약, 전달하여 고객의 시간을 절약"**

### 🌤️ 날씨 메타포 시스템
복잡한 투자 데이터를 누구나 이해할 수 있는 직관적 날씨로 변환:

- **☀️ 맑음**: 강한 상승 전망, 매수 적극 검토
- **⛅ 구름 조금**: 완만한 상승, 안정적 성장 기대
- **☁️ 흐림**: 횡보 또는 불확실, 관망 권고
- **🌧️ 비**: 하락 전망, 매도 검토 필요
- **⛈️ 천둥번개**: 급격한 변동성, 위험 관리 필요
- **❄️ 눈**: 시장 정체, 거래량 감소 예상
- **🌪️ 태풍**: 극심한 변동성, 긴급 대응 필요

### 👤 핵심 타겟 고객

**김나영 (27세, 1년차 직장인) - 대표 페르소나**

#### 📋 고객 특성
- **투자 성향**: 장기 관점의 신중한 투자자
- **투자 경력**: 1년 미만의 초보 투자자  
- **직업**: 풀타임 직장인 (투자 전용 시간 부족)

#### 😰 주요 Pain Points
- 방대한 투자 정보를 소화할 시간적 여유 부족
- 선동적/홍보성 정보로 인한 신뢰도 파악의 어려움
- 일관된 투자 판단 기준 수립의 어려움
- 개인 포트폴리오에 최적화된 정보 부족

#### 🎯 고객 Needs
- **개인화**: 자신의 포트폴리오에 최적화된 맞춤형 정보
- **신뢰성**: 공인된 출처의 검증된 정보만 제공  
- **간편성**: 복잡한 분석 없이 1초만에 파악 가능한 요약 정보
- **시각화**: 직관적이고 이해하기 쉬운 시각적 표현

## ✨ 핵심 서비스 기능

### 🎯 3단계 솔루션 프로세스

#### 1️⃣ 개인 투자 성향 분석
**"나만의 투자 DNA 발견"**
- **종합 프로파일링**: 나이, 직업, 투자 경력, 보유 종목 수, 투자 목표 등 종합 분석
- **리스크 성향 평가**: 개인의 위험 선호도와 투자 패턴 분석
- **맞춤형 기준 설정**: 분석된 성향을 기반으로 한 개인화된 정보 필터링
- **커뮤니티 매칭**: 유사한 성향의 사용자들과의 인사이트 공유 기반 마련

#### 2️⃣ 투자 정보 크롤링, 요약, 분석  
**"신뢰할 수 있는 정보만 골라서"**
- **공인 정보 수집**: 금감원, 한국거래소, 상장회사 등 공신력 있는 출처만 선별
- **실시간 크롤링**: 사용자 의뢰 종목에 대한 최신 정보 자동 수집
- **AI 요약 분석**: 복잡한 재무제표, 공시정보를 이해하기 쉽게 요약
- **날씨 시각화**: 분석 결과를 직관적인 날씨 메타포로 변환
- **피드백 학습**: 사용자 평가를 통한 개인 성향 데이터 실시간 업데이트

#### 3️⃣ 투자 전망 제공 및 맞춤형 추천
**"내 포트폴리오 맞춤 전망"**
- **다기간 전망**: 30일, 분기, 반기, 1년 단위의 체계적 전망 제공
- **개인화 추천**: 분석된 투자 성향 기반 관심 종목 및 투자 상품 추천  
- **커뮤니티 인사이트**: 유사 성향 사용자들의 포트폴리오와 추천 리포트 열람
- **성과 추적**: 날씨 예보의 정확도와 실제 수익률 상관관계 분석

### 🌤️ 핵심 기술 기능

#### 📊 지능형 날씨 변환 엔진
- **실시간 데이터 처리**: 주식 데이터를 즉시 날씨 상태로 변환
- **다층 분석**: 기술적 지표, 기본면 분석, 시장 심리를 종합한 날씨 판정
- **정확도 개선**: 머신러닝 기반 예측 정확도 지속 향상

#### 🤖 AI 기반 개인화 엔진  
- **성향 학습**: 사용자의 투자 패턴과 선호도 지속 학습
- **자연어 분석**: 복잡한 금융 정보를 쉬운 언어로 번역
- **맞춤형 리포트**: 개인 포트폴리오 특성을 반영한 분석 리포트

#### 🔔 실시간 알림 시스템
- **스마트 알림**: 중요도와 개인 성향을 고려한 선별적 알림
- **다채널 지원**: 웹, 모바일, 이메일을 통한 통합 알림 서비스

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
- **AI 분석**: OpenAI API (주식 데이터를 날씨 표현으로 변환)
- **주식 데이터**: 한국투자증권 KIS API (실시간 시세, 기술적 지표)
- **공시 정보**: 전자공시시스템 DART API (기업 공시 데이터)
- **뉴스 데이터**: 네이버/다음 뉴스 API (시장 심리 분석용)

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

# 개인 투자 성향 분석
POST /users/profile/analyze         # 투자 성향 종합 분석
GET  /users/profile/risk-score      # 리스크 성향 평가 결과
PUT  /users/profile/preferences     # 투자 선호도 업데이트

# 투자 정보 크롤링 및 분석
POST /stock/crawl-analyze/:code     # 특정 종목 정보 수집 및 분석
GET  /stock/weather/:code           # 종목의 현재 날씨 상태
GET  /stock/weather/forecast        # 다기간 날씨 예보 (30일/분기/반기/1년)
POST /stock/feedback                # 리포트 유용성 평가 피드백

# 맞춤형 추천 및 커뮤니티
GET  /recommendations/portfolio     # 개인화된 종목 추천
GET  /recommendations/similar-users # 유사 성향 사용자 포트폴리오
GET  /community/insights            # 커뮤니티 투자 인사이트

# AI 분석 및 리포트
POST /ai-analysis/personalized-brief   # 개인화된 날씨 브리핑
POST /ai-analysis/weather-report       # 종합 날씨 리포트 생성
GET  /ai-analysis/accuracy-tracking    # 예측 정확도 추적

# WebSocket 이벤트
/events/weather-change     # 종목 날씨 상태 변화 알림
/events/weather-forecast   # 실시간 날씨 예보 업데이트  
/events/weather-alert      # 기상 특보 (태풍, 폭염 등)
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

### 🚀 제품 개발 로드맵 (2024년 하반기)

#### 💎 프리미엄 구독 서비스 론칭
- **기본형**: 일일 날씨 요약 및 5개 종목 추적 (월 9,900원)
- **프리미엄**: 무제한 종목 추적 + 개인화 리포트 (월 19,900원)  
- **프로**: 커뮤니티 인사이트 + 전문가 리포트 (월 39,900원)

#### 🎯 핵심 기능 고도화
- **투자 성향 분석 고도화**: 행동경제학 기반 더 정교한 성향 분석
- **AI 개인화 엔진 고도화**: GPT-4 기반 맞춤형 투자 인사이트 생성
- **커뮤니티 기능 확장**: 유사 성향 사용자간 포트폴리오 공유 및 토론
- **성과 추적 시스템**: 날씨 예보 정확도와 실제 수익률 상관관계 분석

#### 📱 플랫폼 확장
- **모바일 앱**: iOS/Android 네이티브 앱 개발
- **브라우저 확장**: Chrome/Safari 확장 프로그램으로 실시간 날씨 확인
- **API 서비스**: 서드파티 개발자를 위한 날씨 데이터 API 제공

#### 🤝 파트너십 및 데이터 확장  
- **증권사 연동**: 실제 포트폴리오 연동을 통한 더 정확한 개인화
- **뉴스 파트너십**: 신뢰할 수 있는 금융 뉴스 소스와의 제휴
- **해외 시장 확장**: 미국, 일본 주식 시장 날씨 서비스 확장

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
- **이메일**: dev@stockweather.com
- **슬랙**: #stockweather-dev
- **이슈 트래커**: [GitHub Issues](https://github.com/your-username/stockweather-backend/issues)

### 비즈니스 문의
- **사업 제휴**: biz@stockweather.com
- **투자 문의**: invest@stockweather.com
- **고객 지원**: support@stockweather.com

### 커뮤니티
- **베타 테스터 모집**: [StockWeather 얼리어답터](https://discord.gg/stockweather)
- **사용자 피드백**: 실제 "김나영"님 같은 사용자 의견 적극 수집
- **개발자 밋업**: 매월 셋째 주 토요일 (핀테크 개발자 네트워킹)

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
- **한국투자증권** - KIS API를 통한 실시간 주식 시세 데이터
- **전자공시시스템** - DART API를 통한 기업 공시 정보
- **네이버/다음** - 뉴스 데이터를 통한 시장 심리 분석

---

<div align="center">
  
### 🌤️ StockWeather - "1초만에 확인하는 투자 전망" 🚀

<sub>Built with ❤️ by StockWeather Team</sub>

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요! ⭐**

</div>
