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

ENV NODE_ENV production
ENV PORT 8080

ARG ENTRY_FILE=main
ENV ENTRY_FILE=${ENTRY_FILE}

CMD ["sh", "-c", "node dist/$ENTRY_FILE.js"]
