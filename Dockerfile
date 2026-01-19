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

# Make startup script executable
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3001

# Start server (runs migrations first)
CMD ["./start.sh"]
