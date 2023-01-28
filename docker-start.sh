#!/bin/sh
set -e
npm install -g pnpm
pnpm prisma migrate deploy --schema prisma/schema.prisma
pnpm start
