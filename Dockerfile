FROM node:22-alpine
RUN mkdir -p /home/node/app/node_modules && \
    mkdir -p /home/node/app/logs && \
    chown -R node:node /home/node/app
WORKDIR /home/node/app

# Copy package files first
COPY --chown=node:node package*.json ./
USER node

# Install dependencies
RUN npm install

# Copy source files
COPY --chown=node:node . .

# Build
RUN npx prisma generate
RUN npm run build

# Clean up source and dev dependencies
RUN npm prune --production && \
    rm -rf src test types

EXPOSE 3000
CMD [ "node", "dist/index.js" ]