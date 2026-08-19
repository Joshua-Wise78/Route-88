FROM oven/bun:1-slim

WORKDIR /app

# Install dependencies first for better caching
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3333

# Start the application
CMD ["bun", "run", "start"]
