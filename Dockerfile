FROM node:24-trixie-slim as build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
WORKDIR /home/node/
COPY . .
RUN pnpm pkg delete scripts.prepare

RUN apt update
RUN apt install -y python3 libcurl4-openssl-dev libssl-dev build-essential

RUN corepack install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:24-trixie-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
LABEL org.opencontainers.image.source=https://github.com/LEDBrain/Community-Service
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /home/node/
COPY --from=build /home/node/package.json ./
COPY --from=build /home/node/pnpm-lock.yaml ./
COPY --from=build /home/node/dist ./
COPY --from=build /home/node/prisma ./prisma
RUN apt update
RUN apt install -y python3 libcurl4-openssl-dev libssl-dev build-essential openssl
RUN corepack install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod
# USER root

EXPOSE 3000

ENV DISCORD_TOKEN $DISCORD_TOKEN
ENV DISCORD_CLIENT_ID $DISCORD_CLIENT_ID
ENV DISCORD_DEV_GUILD_ID $DISCORD_DEV_GUILD_ID
ENV DATABASE_URL $DATABASE_URL
ENV PORT 3000
ENV HOST $HOSTNAME

CMD pnpm run migrate:prod && node ./src/index.js