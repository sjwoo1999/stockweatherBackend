# Stage 1: Build the NestJS application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Run the NestJS application (최종 이미지)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV NODE_ENV production
ENV PORT 8080 # Cloud Run 에서 기본 8080, 명시하면 좋음

# 🔥 가장 안정적이고 권장되는 실행 방식
CMD [ "node", "dist/main.js" ]
