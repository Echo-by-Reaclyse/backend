#!/usr/bin/env tsx
/**
 * ECH-312 — reduce the question bank from eight categories to five.
 *
 * Keep: Decisions, Identity, Relationships, Fear, Gratitude.
 *
 *   Future     → merged into Identity. Its 12 questions are re-tagged, not discarded:
 *                "who am I becoming" answers both at once, which is the whole reason for
 *                the merge.
 *   Creativity → deactivated. Its 11 questions are genuinely about creative expression
 *                ("What art form calls to you?"), so re-tagging them into Identity would
 *                file them under something they are not. They stay in the table, inactive,
 *                and can be brought back by flipping one boolean.
 *   Freeform   → left ACTIVE on purpose. See the note below.
 *
 * Nothing is deleted. `is_active = false` is enough: `GET /questions` already filters on
 * `q.is_active = true AND qc.is_active = true`, so a deactivated category's questions stop
 * reaching the app immediately, and no row is lost.
 *
 * Why Freeform stays active
 * -------------------------
 * ECH-312 asks for Freeform to be removed from the *picker*, because "Just say it" on the
 * home card is already that mode and more prominent. It does not ask for its questions to
 * be retired, and they should not be: they are the strongest general dailies in the bank
 * ("What did today teach you?", "What surprised you today?", "What feels unfinished?").
 * They are already invisible as a *category* — iOS builds its picker from
 * `QuestionTheme.selectable`, which omits freeform — so leaving them active keeps ten good
 * questions in the "Any category" rotation at no cost. Deactivating the category here would
 * silently delete them from the product.
 *
 * Idempotent: safe to run more than once.
 *
 * Usage:
 *   DATABASE_URL=<neon-url> npx tsx scripts/cleanup-question-categories.ts
 *   npx tsx --env-file=.env scripts/cleanup-question-categories.ts
 *
 * Pass --dry-run to print what would change without writing anything.
 */
import { sql } from "../src/lib/db.js";

const DRY_RUN = process.argv.includes("--dry-run");

interface CountRow {
  slug: string;
  name: string;
  is_active: boolean;
  question_count: number;
}

async function report(label: string): Promise<void> {
  const rows = (await sql`
    SELECT qc.slug,
           qc.name,
           qc.is_active,
           COUNT(q.id) FILTER (WHERE q.is_active) AS question_count
    FROM question_categories qc
    LEFT JOIN questions q ON q.category_id = qc.id
    GROUP BY qc.slug, qc.name, qc.is_active, qc.sort_order
    ORDER BY qc.sort_order
  `) as unknown as CountRow[];

  console.log(`\n[cleanup] ${label}`);
  for (const r of rows) {
    const state = r.is_active ? "active  " : "INACTIVE";
    console.log(`  ${state}  ${r.slug.padEnd(14)} ${String(r.question_count).padStart(4)} active questions`);
  }
  const served = rows
    .filter((r) => r.is_active)
    .reduce((sum, r) => sum + Number(r.question_count), 0);
  console.log(`  → ${served} questions reaching the app`);
}

async function main(): Promise<void> {
  await report("before");

  if (DRY_RUN) {
    console.log("\n[cleanup] --dry-run: nothing written.");
    return;
  }

  // 1. Future → Identity. Re-tag first, so the questions are safe before the category that
  //    owned them is switched off; if this script dies between the two steps, the worst case
  //    is that Future is still active with zero questions, which is harmless.
  const moved = await sql`
    UPDATE questions
    SET category_id = (SELECT id FROM question_categories WHERE slug = 'identity'),
        updated_at  = now()
    WHERE category_id = (SELECT id FROM question_categories WHERE slug = 'future')
    RETURNING id
  `;
  console.log(`\n[cleanup] re-tagged ${moved.length} Future questions to Identity`);

  // 2. Retire Future and Creativity as categories. Their rows stay.
  const retired = await sql`
    UPDATE question_categories
    SET is_active = false, updated_at = now()
    WHERE slug IN ('future', 'creativity') AND is_active = true
    RETURNING slug
  `;
  console.log(`[cleanup] deactivated: ${retired.map((r) => (r as { slug: string }).slug).join(", ") || "(already done)"}`);

  // 3. Make sure the five keepers are on, in case a previous run or manual edit turned one
  //    off. This is the definition of the intended end state, not just a diff against it.
  await sql`
    UPDATE question_categories
    SET is_active = true, updated_at = now()
    WHERE slug IN ('decisions', 'identity', 'relationships', 'fear', 'gratitude', 'freeform')
      AND is_active = false
  `;

  await report("after");

  // Bumping updated_at above moves the version GET /questions computes, so every client
  // picks the change up on its next sync rather than waiting for a cache to lapse.
  console.log("\n[cleanup] done. Clients resync on next launch (the questions version moved).");
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("[cleanup] FAILED:", err);
    process.exit(1);
  });
