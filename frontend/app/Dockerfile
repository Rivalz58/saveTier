# Étape de build (construction) de l'application avec Node.js
FROM node:20-bullseye AS builder

# Dossier de travail dans le conteneur
WORKDIR /app

# Activation de Corepack et préparation de Yarn 4.9.0
RUN corepack enable && corepack prepare yarn@4.9.0 --activate

# Copie des fichiers de configuration de Yarn et des dépendances
COPY package*.json .yarnrc.yml ./
COPY .yarn ./.yarn

# Installation des dépendances via Yarn
RUN yarn install

# Copie des fichiers de configuration TypeScript et autres fichiers nécessaires
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY index.html Caddyfile vite.config.ts ./
COPY src src
COPY public public

# Définition d'une variable d'environnement pour l'URL de l'API
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build (compilation) de l'application avec Vite
RUN yarn build

# Étape serveur avec Caddy, pour servir les fichiers statiques générés
FROM caddy:2.9.1-alpine AS server

# Dossier de travail du serveur
WORKDIR /srv

# Copie des fichiers compilés depuis l'étape précédente
COPY --from=builder /app/dist ./

# Copie du fichier de configuration de Caddy
COPY Caddyfile /etc/caddy/Caddyfile

# Ouverture des ports HTTP (80) et HTTPS (443)
EXPOSE 80 443

# Commande de lancement du serveur Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
