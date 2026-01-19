FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY backend/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy all backend source files
COPY backend/src ./src
COPY backend/start.sh ./start.sh

# Make startup script executable
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3001

# Start server (runs migrations first)
CMD ["./start.sh"]
