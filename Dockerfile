FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the source files
COPY . .

# Run after copy in case of schema change
RUN bunx prisma generate

# Create minified js file in dist/
RUN NODE_ENV=production bun build src/app.ts --outdir=dist --target=bun --minify

# Production stage (final image)
FROM oven/bun:slim
WORKDIR /app

# Copy the build output from the base stage
COPY --from=base /usr/src/app/dist ./dist

# Prisma client (runtime deps)
COPY --from=base /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Create log dir
RUN mkdir -p /app/logs && chown -R bun:bun /app/logs
USER bun
EXPOSE 3000
CMD ["bun", "dist/app.js"]
