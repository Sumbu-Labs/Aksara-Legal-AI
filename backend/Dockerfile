# syntax=docker/dockerfile:1.7

FROM node:22-slim AS builder
WORKDIR /usr/src/app

# Install dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

# Build application
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Remove dev dependencies for lean runtime
RUN npm prune --production

FROM node:22-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy runtime dependencies and built application
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/package-lock.json ./
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
