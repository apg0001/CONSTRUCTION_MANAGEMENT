# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install pnpm if not available
RUN npm install -g pnpm

# Install dependencies
# --no-frozen-lockfile: package.json이 변경되었을 때 lockfile 자동 업데이트
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build argument for API URL (기본값 없음 - 런타임에 결정)
# ngrok 사용 시 /api 프록시를 사용하므로 빌드 시점 설정 불필요
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

