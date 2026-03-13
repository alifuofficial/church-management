#!/bin/bash
set -e

# Ensure the database directory exists
mkdir -p /app/db

# If the database file doesn't exist, initialize it
if [ ! -f /app/db/church.db ]; then
  echo "Database not found, initializing..."
  # Use local binary to avoid npx/npm permission issues with home directory
  node node_modules/prisma/build/index.js db push --accept-data-loss
fi

# Execute the main command
exec "$@"
