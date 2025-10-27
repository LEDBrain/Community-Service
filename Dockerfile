FROM node:25-slim as build
WORKDIR /home/node/
COPY . .
RUN npm pkg delete scripts.prepare

RUN apt update
RUN apt install -y python3 libcurl4-openssl-dev libssl-dev build-essential

RUN npm ci
RUN npm run build

FROM node:25-slim
LABEL org.opencontainers.image.source=https://github.com/LEDBrain/Community-Service
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /home/node/
COPY --from=build /home/node/package*.json ./
COPY --from=build /home/node/dist ./
COPY --from=build /home/node/prisma ./prisma
RUN apt update
RUN apt install -y python3 libcurl4-openssl-dev libssl-dev build-essential openssl
RUN npm ci --omit=dev
# USER root

EXPOSE 3000

ENV DISCORD_TOKEN $DISCORD_TOKEN
ENV DISCORD_CLIENT_ID $DISCORD_CLIENT_ID
ENV DISCORD_DEV_GUILD_ID $DISCORD_DEV_GUILD_ID
ENV DATABASE_URL $DATABASE_URL
ENV PORT 3000
ENV HOST $HOSTNAME

CMD npm run migrate:prod && node ./src/index.js