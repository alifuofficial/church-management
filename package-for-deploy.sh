#!/bin/bash

# Package Church Management System for Deployment
# Run this locally to create a tarball for upload

set -e

# Get version from package.json
VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"*\([^"]*\)".*/\1/')

# Output filename
OUTPUT="church-management-system-v${VERSION}.tar.gz"

echo "=========================================="
echo "Packaging Church Management System"
echo "Version: $VERSION"
echo "=========================================="

# Files and directories to include
INCLUDE=(
  "app"
  "components"
  "lib"
  "prisma"
  "public"
  "store"
  "types"
  "db"
  "package.json"
  "bun.lockb"
  "tsconfig.json"
  "next.config.ts"
  "tailwind.config.ts"
  "postcss.config.mjs"
  "components.json"
  ".env.example"
  "Dockerfile"
  "docker-compose.yml"
  "nginx.conf"
  "DEPLOYMENT.md"
  "deploy.sh"
  "src"
)

# Files and directories to exclude
EXCLUDE=(
  "node_modules"
  ".next"
  ".git"
  "*.log"
  ".env"
  "*.db"
  "*.db-journal"
)

# Create exclude arguments
EXCLUDE_ARGS=""
for item in "${EXCLUDE[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$item"
done

# Create tarball
echo ""
echo "Creating archive: $OUTPUT"
tar -czvf "$OUTPUT" $EXCLUDE_ARGS "${INCLUDE[@]}"

# Get file size
SIZE=$(du -h "$OUTPUT" | cut -f1)

echo ""
echo "=========================================="
echo "Package created successfully!"
echo "=========================================="
echo ""
echo "File: $OUTPUT"
echo "Size: $SIZE"
echo ""
echo "Upload to VPS:"
echo "  scp $OUTPUT user@your-vps:~/"
echo ""
echo "On VPS, extract:"
echo "  tar -xzvf $OUTPUT"
echo "  cd church-management-system"
echo "  bash deploy.sh"
echo ""
