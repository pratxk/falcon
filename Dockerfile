# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS builder

# Install Yarn
RUN apk add --no-cache yarn

# Set working directory
WORKDIR /app

# Copy package files and yarn.lock
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn prisma:generate

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine AS production

# Install Yarn
RUN apk add --no-cache yarn

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["yarn", "start"] 