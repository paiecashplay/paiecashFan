FROM node:22-alpine

WORKDIR /app

# IMPORTANT : on copie tout le code AVANT npm install.
# Ainsi le moindre changement de code invalide cette couche (et toutes
# les suivantes) → fini le "COPY . . cached" qui servait du vieux code.
# Le .dockerignore exclut node_modules pour garder le contexte léger.
COPY . .

RUN npm install --production

# Expose the API port
EXPOSE 3001

# Run the server
CMD ["node", "server.js"]
