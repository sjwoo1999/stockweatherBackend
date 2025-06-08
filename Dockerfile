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
ENV PORT 8080 # Cloud Run 기본 포트

# 기본은 REST API용 main.ts
# deploy-websocket.yml 에서 CMD override 시 main-ws.ts 사용 가능

ARG ENTRY_FILE=main
ENV ENTRY_FILE=${ENTRY_FILE}

CMD ["sh", "-c", "node dist/$ENTRY_FILE.js"]
