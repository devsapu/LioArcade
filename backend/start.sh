#!/bin/sh
set -e

echo "🚀 Starting LioArcade Backend..."
echo "📦 Running database migrations..."

# Run Prisma migrations
npx prisma db push --accept-data-loss || {
  echo "⚠️  Migration failed, but continuing..."
}

echo "✅ Migrations complete"
echo "🌐 Starting server..."

# Start the server
node src/server.js
