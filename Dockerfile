# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install Yarn
RUN apk add --no-cache yarn

# Set working directory
WORKDIR /app

# Copy package files and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn prisma:generate

# Build the application
RUN yarn build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["yarn", "start"] 