FROM node:20-slim as build
WORKDIR /home/node/
COPY . .
RUN npm pkg delete scripts.prepare

RUN apt update
RUN apt install -y python3 libcurl4-openssl-dev libssl-dev build-essential

RUN npm ci
RUN npm run build

FROM node:20-alpine as cleanup
WORKDIR /home/node/
COPY --from=build /home/node/package*.json ./
COPY --from=build /home/node/dist ./dist
COPY --from=build /home/node/prisma ./prisma
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /home/node/
COPY --from=cleanup /home/node/ ./
USER root

EXPOSE 3000

ENV DISCORD_TOKEN $DISCORD_TOKEN
ENV DISCORD_CLIENT_ID $DISCORD_CLIENT_ID
ENV DISCORD_DEV_GUILD_ID $DISCORD_DEV_GUILD_ID
ENV DATABASE_URL $DATABASE_URL
ENV PORT 3000
ENV HOST $HOSTNAME

CMD npm run migrate:prod && node dist/src/index.js