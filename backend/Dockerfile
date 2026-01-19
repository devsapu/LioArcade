FROM node:20-alpine

WORKDIR /app

# Copy package files from backend directory
COPY backend/package.json backend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema from backend directory
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy all source files from backend directory
COPY backend/src ./src
COPY backend/start.sh ./start.sh

# Make startup script executable
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3001

# Start server (runs migrations first)
CMD ["./start.sh"]
