# Stage 1
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
ENV PORT=8080

# ENTRY_FILE 은 WebSocket 전용 빌드에서만 사용
ARG ENTRY_FILE
ENV ENTRY_FILE=${ENTRY_FILE}

CMD ["sh", "-c", "node dist/$ENTRY_FILE.js"]
