FROM node:18.14.2-alpine as build
WORKDIR /usr/app
COPY . .
RUN npm pkg delete scripts.prepare
RUN npm ci
RUN npm run build

FROM node:18.14.2-alpine as cleanup
WORKDIR /usr/app
COPY --from=build /usr/app/package*.json ./
COPY --from=build /usr/app/dist ./dist
COPY --from=build /usr/app/prisma ./prisma
RUN npm ci --omit=dev

FROM node:18.14.2-alpine
WORKDIR /usr/app
COPY --from=cleanup /usr/app ./
USER 1000

EXPOSE 3000

ENV DISCORD_TOKEN $DISCORD_TOKEN
ENV DISCORD_CLIENT_ID $DISCORD_CLIENT_ID
ENV DISCORD_DEV_GUILD_ID $DISCORD_DEV_GUILD_ID
ENV DATABASE_URL $DATABASE_URL
ENV PORT 3000
ENV HOST $HOSTNAME

CMD npm run migrate:prod && npm run start