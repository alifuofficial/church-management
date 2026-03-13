#!/bin/bash
set -e

# Ensure the database directory exists
mkdir -p /app/db /app/db/uploads

# Ensure public/uploads exists in the runner layer and symlink to persistent storage if needed
if [ ! -L /app/public/uploads ]; then
  echo "Setting up persistent uploads symlink..."
  # Remove existing local uploads if they exist (they shouldn't in production)
  rm -rf /app/public/uploads
  # Create symlink: public/uploads -> /app/db/uploads
  ln -s /app/db/uploads /app/public/uploads
fi

# If the database file doesn't exist, initialize it
if [ ! -f /app/db/church.db ]; then
  echo "Database not found, initializing..."
  # Use npx prisma@6 to ensure we use a compatible version and don't rely on local path
  npx prisma@6 db push --accept-data-loss
fi

# Execute the main command
exec "$@"
