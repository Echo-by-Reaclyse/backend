/**
 * Creates the blog_posts table in Neon DB.
 * Run once with: npx tsx scripts/migrate-blog-posts.ts
 * (from the backend/ directory, with DATABASE_URL in your .env)
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  console.log("Running blog_posts migration…");

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      slug              TEXT        UNIQUE NOT NULL,
      status            TEXT        NOT NULL DEFAULT 'draft',
      title             TEXT        NOT NULL,
      search_title      TEXT,
      description       TEXT,
      excerpt           TEXT,
      topic             TEXT        NOT NULL DEFAULT 'voice',
      reading_time      TEXT,
      author            TEXT        NOT NULL DEFAULT 'The ÉCHO Team',
      in_short          TEXT,
      card_visual       JSONB       NOT NULL DEFAULT '{"type":"image"}',
      sections          JSONB       NOT NULL DEFAULT '[]',
      related_slugs     TEXT[]      NOT NULL DEFAULT '{}',
      seo_og_image      TEXT,
      seo_canonical_url TEXT,
      published_at      TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("✅  blog_posts table ready.");
}

run().catch((err) => {
  console.error("❌  Migration failed:", err);
  process.exit(1);
});
