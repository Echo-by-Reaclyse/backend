#!/usr/bin/env tsx
/**
 * Run database migrations + seed data.
 *
 * Usage:
 *   DATABASE_URL=<neon-url> npx tsx scripts/migrate.ts
 *   # or, if dotenv is available:
 *   npx tsx --env-file=.env scripts/migrate.ts
 */
import { runMigrations } from "../src/lib/migrate.js";

runMigrations()
  .then(() => {
    console.log("[migrate] finished successfully");
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error("[migrate] FAILED:", err);
    process.exit(1);
  });
