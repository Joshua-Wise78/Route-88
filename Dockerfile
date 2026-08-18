FROM oven/bun:1-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3333

# Start the application
CMD ["bun", "run", "start"]
