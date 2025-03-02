FROM node:22-alpine
WORKDIR /home/node/app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build
RUN npx prisma generate
RUN npm run build

# Clean up source and dev dependencies
RUN npm prune --production && \
    rm -rf src test types

EXPOSE 3000
CMD [ "node", "dist/app.js" ]