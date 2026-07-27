#!/bin/sh
set -e

echo "Running database migrations..."
pnpm run migrate:prod

echo "Starting application..."
exec node ./src/index.js
