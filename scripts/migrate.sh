#!/bin/bash

echo "Running Prisma migrations..."

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push --skip-generate

echo "Migration complete!"