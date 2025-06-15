FROM node:20-bullseye AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.9.0 --activate

COPY package*.json .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY index.html Caddyfile vite.config.ts ./
COPY src src
COPY public public

ARG VITE_API_BASE_URL

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN yarn build

FROM caddy:2.9.1-alpine AS server

WORKDIR /srv

COPY --from=builder /app/dist ./

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
