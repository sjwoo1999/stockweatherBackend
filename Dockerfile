# Stage 1
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2
FROM node:20-alpine
WORKDIR /app

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production
ENV PORT=8080

# ENTRY_FILE 은 main-ws 또는 main-rest 를 받아서 실행
ARG ENTRY_FILE
ENV ENTRY_FILE=${ENTRY_FILE}

# Final CMD
CMD ["node", "dist/${ENTRY_FILE}.js"]