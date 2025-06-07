# Dockerfile

# Stage 1: Build the NestJS application
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
RUN npm run build

# Stage 2: Run the NestJS application (최종 이미지)
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# builder 스테이지에서 빌드된 결과물 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# ⭐⭐⭐ 수정된 부분: .env.production 파일 COPY 줄을 삭제합니다. ⭐⭐⭐
# COPY --from=builder /app/.env.production ./.env.production # 로컬에 없으므로 이 줄은 삭제합니다.

# Cloud Run에서 PORT 환경 변수를 자동으로 주입하므로 명시적인 포트 노출은 선택 사항
# EXPOSE 3000

# 환경 변수 설정 (Cloud Run에서 직접 설정할 것이므로 Dockerfile에는 기본값만)
ENV NODE_ENV production
# ENV PORT 3000 # Cloud Run이 자동으로 주입하므로 이 줄은 여전히 필요 없습니다.
# Dockerfile에서 MODE의 기본값을 설정할 수도 있지만,
# Cloud Run 배포 시 --set-env-vars MODE=WS 로 직접 주입하는 것이 더 명확합니다.

# 애플리케이션 실행 명령어
# NestJS package.json의 'start:prod' 스크립트 사용
CMD [ "npm", "run", "start:prod" ]