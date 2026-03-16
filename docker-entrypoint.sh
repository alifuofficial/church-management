#!/bin/bash
set -e

# Ensure the database and canonical uploads directory exist with correct ownership
mkdir -p /app/db /app/db/uploads/images
chown -R nextjs:nodejs /app/db

# Ensure the public directory and base uploads directory exist
mkdir -p /app/public/uploads
chown nextjs:nodejs /app/public /app/public/uploads

# Setup granular symlinks for individual upload paths
# This avoids Permission Denied when trying to rm -rf a volume-mounted /app/public/uploads
for type in "image" "images"; do
  TARGET="/app/public/uploads/$type"
  if [ ! -L "$TARGET" ]; then
    echo "Setting up persistent symlink for $TARGET..."
    # If it's a real directory (not a link), and it's not a mount point, try to remove it
    if [ -d "$TARGET" ] && ! mountpoint -q "$TARGET"; then
      rm -rf "$TARGET"
    fi
    # Link to the canonical persistent images folder
    ln -sf /app/db/uploads/images "$TARGET"
    chown -h nextjs:nodejs "$TARGET"
  fi
done

# Sync database schema on every startup
echo "Synchronizing database schema..."
# Run prisma as nextjs user
gosu nextjs npx prisma db push --accept-data-loss

# Execute the main command as nextjs user
echo "Starting application as nextjs user..."
exec gosu nextjs "$@"
