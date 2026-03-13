#!/bin/bash
set -e

# Ensure the database and uploads directory exist with correct ownership
mkdir -p /app/db /app/db/uploads
chown -R nextjs:nodejs /app/db

# Handle persistent uploads symlink with root privileges
if [ ! -L /app/public/uploads ]; then
  echo "Setting up persistent uploads symlink..."
  # Use -f to force removal even if non-empty or permission-locked files exist (now running as root)
  rm -rf /app/public/uploads
  # Create symlink: public/uploads -> /app/db/uploads
  ln -s /app/db/uploads /app/public/uploads
  chown -h nextjs:nodejs /app/public/uploads
fi

# If the database file doesn't exist, initialize it
if [ ! -f /app/db/church.db ]; then
  echo "Database not found, initializing..."
  # Run prisma as nextjs user
  gosu nextjs npx prisma@6 db push --accept-data-loss
fi

# Execute the main command as nextjs user
echo "Starting application as nextjs user..."
exec gosu nextjs "$@"
