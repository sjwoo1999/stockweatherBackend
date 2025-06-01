# Dockerfile

# Stage 1: Build the NestJS application
# Node.js 20 LTS 버전을 사용 (NestJS 권장)
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐싱 활용)
COPY package*.json ./

# 의존성 설치
RUN npm install

# 모든 소스 코드 복사
COPY . .

# NestJS 애플리케이션 빌드
# package.json에 'build' 스크립트가 'nest build'라면 그대로 사용
RUN npm run build

# Stage 2: Run the NestJS application (최종 이미지)
# 더 가벼운 Node.js 런타임 이미지 사용
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# builder 스테이지에서 빌드된 결과물 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Cloud Run에서 PORT 환경 변수를 자동으로 주입하므로 명시적인 포트 노출은 선택 사항
# EXPOSE 3000

# 환경 변수 설정 (Cloud Run에서 직접 설정할 것이므로 Dockerfile에는 기본값만)
ENV NODE_ENV production
# ⭐ 다음 라인을 삭제합니다. Cloud Run이 자동으로 PORT를 주입합니다.
# ENV PORT 3000 

# 애플리케이션 실행 명령어
# NestJS package.json의 'start:prod' 스크립트 사용
CMD [ "npm", "run", "start:prod" ]