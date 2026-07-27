# ---- Builder ----------------------------------------------------------------
FROM node:24-trixie-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

# Provide a placeholder URL so `prisma generate` (called inside `pnpm run build`)
# can parse prisma.config.ts without a real database being present at build time.
ARG DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"
ENV DATABASE_URL=$DATABASE_URL

RUN corepack enable

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        libcurl4-openssl-dev \
        libssl-dev \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests before source for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Activate the pinned package manager, then strip the husky prepare hook so
# pnpm install does not try to run it in a CI/Docker context.
RUN corepack install && pnpm pkg delete scripts.prepare

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


# ---- Runtime ----------------------------------------------------------------
FROM node:24-trixie-slim

LABEL org.opencontainers.image.source=https://github.com/LEDBrain/Community-Service
LABEL org.opencontainers.image.licenses=MIT

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        libcurl4-openssl-dev \
        libssl-dev \
        build-essential \
        openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy only the files needed at runtime.
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma
# dist/src/ is the esbuild output; copy it so ./src/index.js is available.
COPY --from=builder /app/dist ./

RUN corepack install && pnpm pkg delete scripts.prepare
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

USER node

ENTRYPOINT ["./entrypoint.sh"]
