#!/bin/bash

# Install dependencies
npm install

# Build frontend
npx vite build

# Build backend
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"