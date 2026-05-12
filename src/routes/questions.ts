import { Hono } from "hono";
import { sql } from "../lib/db.js";

// ─── DB row types ─────────────────────────────────────────────────────────────

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  updated_at: Date;
}

interface QuestionRow {
  id: string;
  text: string;
  category_slug: string;
  sort_order: number;
  is_active: boolean;
  updated_at: Date;
}

interface VersionRow {
  version: Date | null;
}

// ─── Route ────────────────────────────────────────────────────────────────────

const questions = new Hono();

/**
 * GET /questions[?since=<ISO-date>]
 *
 * Public — no auth required. iOS client calls this to sync the question bank.
 *
 * If `since` matches the current `version`, returns { version, upToDate: true }.
 * Otherwise returns the full payload of active categories + questions.
 */
questions.get("/", async (c) => {
  // Compute the most recent updated_at across both tables
  const versionRows = await sql`
    SELECT GREATEST(
      (SELECT MAX(updated_at) FROM question_categories),
      (SELECT MAX(updated_at) FROM questions)
    ) AS version
  `;
  const rawVersion = (versionRows[0] as VersionRow).version;
  const version = rawVersion ? rawVersion.toISOString() : new Date(0).toISOString();

  // Check ?since= for cache short-circuit
  const since = c.req.query("since");
  if (since && since === version) {
    return c.json({ version, upToDate: true });
  }

  // Fetch active categories ordered by sort_order
  const categoryRows = await sql`
    SELECT id, name, slug, sort_order, is_active, updated_at
    FROM question_categories
    WHERE is_active = true
    ORDER BY sort_order ASC
  `;

  // Fetch active questions with their category slug, ordered by category then question
  const questionRows = await sql`
    SELECT
      q.id,
      q.text,
      qc.slug AS category_slug,
      q.sort_order,
      q.is_active,
      q.updated_at
    FROM questions q
    JOIN question_categories qc ON qc.id = q.category_id
    WHERE q.is_active = true AND qc.is_active = true
    ORDER BY qc.sort_order ASC, q.sort_order ASC
  `;

  const categories = (categoryRows as CategoryRow[]).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    sort_order: r.sort_order,
    is_active: r.is_active,
  }));

  const questionList = (questionRows as QuestionRow[]).map((r) => ({
    id: r.id,
    text: r.text,
    category_slug: r.category_slug,
    sort_order: r.sort_order,
    is_active: r.is_active,
  }));

  return c.json({ version, categories, questions: questionList });
});

export { questions as questionsRoute };
