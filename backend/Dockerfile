FROM node:22-alpine

WORKDIR /app

# Prisma necesita las bibliotecas OpenSSL para cargar su motor nativo dentro
# de Alpine Linux.
RUN apk add --no-cache openssl

COPY package*.json ./
# Prisma se conserva en la imagen porque el Job de Kubernetes ejecuta
# "prisma migrate deploy" con la misma imagen de la API.
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY scripts ./scripts

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/app.js"]
