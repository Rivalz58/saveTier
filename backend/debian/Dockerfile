# Base image
FROM node:20-bullseye AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY package.json ./

RUN yarn install

COPY . .

RUN yarn compile

FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.7.0 --activate

COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist

RUN yarn workspaces focus

EXPOSE 8080

CMD ["node", "dist/index.js"]