#!/bin/bash
set -e

# Ensure the database directory exists
mkdir -p /app/db

# If the database file doesn't exist, initialize it
if [ ! -f /app/db/church.db ]; then
  echo "Database not found, initializing..."
  # Use npx prisma@6 to ensure we use a compatible version and don't rely on local path
  npx prisma@6 db push --accept-data-loss
fi

# Execute the main command
exec "$@"
