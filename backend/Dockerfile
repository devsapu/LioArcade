FROM node:20-alpine

WORKDIR /app

# Copy package files (including package-lock.json)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy all source files
COPY src ./src
COPY start.sh ./start.sh

# Make startup script executable
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3001

# Start server (runs migrations first)
CMD ["./start.sh"]
