# ---- Étape 1 : Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code
COPY . .

# Builder le projet Next.js
RUN npm run build

# ---- Étape 2 : Run (Production) ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copier le build et les dépendances minimales
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
