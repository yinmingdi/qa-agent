#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "Starting API (apps/api) with pnpm dev:api..."
pnpm dev:api &
API_PID=$!

echo "Starting Web (apps/web) with pnpm dev:web..."
pnpm dev:web &
WEB_PID=$!

echo "API PID: $API_PID"
echo "WEB PID: $WEB_PID"
echo "Both API and Web dev servers are running."
echo "Press Ctrl+C in this terminal to stop them."

wait

