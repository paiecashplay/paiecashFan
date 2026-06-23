FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Invalide le cache de la copie du code à chaque build (évite que Railway
# réutilise un "COPY . . cached" obsolète et serve du vieux code).
ARG CACHE_BUST=2026-06-24-1
RUN echo "cache_bust=${CACHE_BUST}"

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3001

# Run the server
CMD ["node", "server.js"]
