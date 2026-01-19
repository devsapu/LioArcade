FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
COPY backend/prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy rest of backend files
COPY backend/ .

# Expose port
EXPOSE 3001

# Copy startup script
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Start server (runs migrations first)
CMD ["./start.sh"]
