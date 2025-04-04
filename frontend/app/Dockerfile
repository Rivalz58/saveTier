FROM node:20-bullseye AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY package*.json .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY index.html Caddyfile vite.config.ts ./
COPY src src
COPY public public

RUN yarn build

FROM caddy:latest AS server

WORKDIR /srv

COPY --from=builder /app/dist /srv

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
