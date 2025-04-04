FROM node:20-bullseye AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY package*.json .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install

COPY tsconfig.json ./
COPY src src

RUN yarn build

FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY --from=builder /app/package*.json /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/dist ./dist

RUN yarn workspaces focus --production

EXPOSE 8080

CMD ["node", "dist/index.js"]