FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Cache-bust FIABLE : le SHA du commit (injecté par Railway comme build arg)
# change à chaque déploiement → invalide systématiquement le "COPY . ."
# et garantit que le code frais est embarqué (fini le vieux code servi).
ARG RAILWAY_GIT_COMMIT_SHA=local
RUN echo "build commit: ${RAILWAY_GIT_COMMIT_SHA}"

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3001

# Run the server
CMD ["node", "server.js"]
