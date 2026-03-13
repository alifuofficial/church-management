#!/bin/bash
set -e

# Ensure the database directory exists
mkdir -p /app/db

# If the database file doesn't exist, initialize it
if [ ! -f /app/db/church.db ]; then
  echo "Database not found, initializing..."
  bun run prisma db push --accept-data-loss
fi

# In production, we might want to ensure the latest schema is applied
# But db push is safer for initial setup in this context
# bunx prisma db migrate deploy

# Execute the main command
exec "$@"
