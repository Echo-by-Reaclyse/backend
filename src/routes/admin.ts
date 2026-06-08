import { Hono } from "hono";
import { z } from "zod";
import { sql } from "../lib/db.js";
import { adminMiddleware, type AdminVariables } from "../lib/admin-auth.js";

const admin = new Hono<AdminVariables>();

// All routes require admin auth
admin.use("*", adminMiddleware);

// ─── DB row types ─────────────────────────────────────────────────────────────

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

interface QuestionRow {
  id: string;
  text: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  sort_order: number;
  is_active: boolean;
  translations: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

// ─── Categories ───────────────────────────────────────────────────────────────

// GET /admin/categories — list all (including inactive)
admin.get("/categories", async (c) => {
  const rows = await sql`
    SELECT id, name, slug, description, sort_order, is_active, translations, created_at, updated_at
    FROM question_categories
    ORDER BY sort_order ASC
  `;
  return c.json({ categories: rows as CategoryRow[] });
});

// POST /admin/categories — create
const createCategorySchema = z.object({
  name:         z.string().trim().min(1),
  slug:         z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens"),
  description:  z.string().optional(),
  is_active:    z.boolean().optional(),
  translations: z.record(z.string()).optional().default({}),
});

admin.post("/categories", async (c) => {
  const body = createCategorySchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  const { name, slug, description = null, is_active = true, translations } = body.data;

  // Compute next sort_order
  const maxRows = await sql`SELECT COALESCE(MAX(sort_order), -1) AS max FROM question_categories`;
  const nextOrder = ((maxRows[0] as { max: number }).max) + 1;

  const rows = await sql`
    INSERT INTO question_categories (name, slug, description, sort_order, is_active, translations)
    VALUES (${name}, ${slug}, ${description}, ${nextOrder}, ${is_active}, ${JSON.stringify(translations)}::jsonb)
    RETURNING id, name, slug, description, sort_order, is_active, translations, created_at, updated_at
  `;

  return c.json({ category: rows[0] as CategoryRow }, 201);
});

// PATCH /admin/categories/:id — update any field; translations are merged (JSONB ||)
const updateCategorySchema = z.object({
  name:         z.string().trim().min(1).optional(),
  slug:         z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens").optional(),
  description:  z.string().nullable().optional(),
  sort_order:   z.number().int().min(0).optional(),
  is_active:    z.boolean().optional(),
  translations: z.record(z.string()).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

admin.patch("/categories/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateCategorySchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  const d = body.data;
  const translationsJSON = d.translations ? JSON.stringify(d.translations) : null;
  const rows = await sql`
    UPDATE question_categories SET
      name         = COALESCE(${d.name        ?? null}, name),
      slug         = COALESCE(${d.slug        ?? null}, slug),
      description  = CASE WHEN ${d.description !== undefined} THEN ${d.description ?? null} ELSE description END,
      sort_order   = COALESCE(${d.sort_order  ?? null}, sort_order),
      is_active    = COALESCE(${d.is_active   ?? null}, is_active),
      translations = CASE WHEN ${translationsJSON} IS NOT NULL THEN translations || ${translationsJSON}::jsonb ELSE translations END,
      updated_at   = now()
    WHERE id = ${id}
    RETURNING id, name, slug, description, sort_order, is_active, translations, created_at, updated_at
  `;

  if (rows.length === 0) return c.json({ error: "Category not found" }, 404);
  return c.json({ category: rows[0] as CategoryRow });
});

// DELETE /admin/categories/:id — delete (cascades to questions)
admin.delete("/categories/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await sql`
    DELETE FROM question_categories WHERE id = ${id} RETURNING id
  `;
  if (rows.length === 0) return c.json({ error: "Category not found" }, 404);
  return c.json({ success: true });
});

// POST /admin/categories/reorder — bulk update sort_order
const reorderSchema = z.object({
  orders: z.array(z.object({
    id:         z.string(),
    sort_order: z.number().int().min(0),
  })).min(1),
});

admin.post("/categories/reorder", async (c) => {
  const body = reorderSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  for (const { id, sort_order } of body.data.orders) {
    await sql`
      UPDATE question_categories
      SET sort_order = ${sort_order}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  return c.json({ success: true });
});

// ─── Questions ────────────────────────────────────────────────────────────────

// GET /admin/questions — list all with category info
admin.get("/questions", async (c) => {
  const rows = await sql`
    SELECT
      q.id,
      q.text,
      q.category_id,
      qc.name  AS category_name,
      qc.slug  AS category_slug,
      q.sort_order,
      q.is_active,
      q.translations,
      q.created_at,
      q.updated_at
    FROM questions q
    JOIN question_categories qc ON qc.id = q.category_id
    ORDER BY qc.sort_order ASC, q.sort_order ASC
  `;
  return c.json({ questions: rows as QuestionRow[] });
});

// POST /admin/questions — create
const createQuestionSchema = z.object({
  id:           z.string().trim().min(1).optional(),
  text:         z.string().trim().min(1),
  category_id:  z.string().uuid(),
  sort_order:   z.number().int().min(0).optional(),
  is_active:    z.boolean().optional(),
  translations: z.record(z.string()).optional().default({}),
});

admin.post("/questions", async (c) => {
  const body = createQuestionSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  const { text, category_id, is_active = true, translations } = body.data;
  // Auto-generate a short unique ID if not provided
  const id = body.data.id ?? `q-${Date.now().toString(36)}`;

  // Compute sort_order within the category if not provided
  let sort_order = body.data.sort_order;
  if (sort_order === undefined) {
    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), -1) AS max FROM questions WHERE category_id = ${category_id}
    `;
    sort_order = ((maxRows[0] as { max: number }).max) + 1;
  }

  // Verify category exists
  const catRows = await sql`SELECT id FROM question_categories WHERE id = ${category_id}`;
  if (catRows.length === 0) return c.json({ error: "Category not found" }, 404);

  const rows = await sql`
    INSERT INTO questions (id, text, category_id, sort_order, is_active, translations)
    VALUES (${id}, ${text}, ${category_id}, ${sort_order}, ${is_active}, ${JSON.stringify(translations)}::jsonb)
    RETURNING id, text, category_id, sort_order, is_active, translations, created_at, updated_at
  `;

  return c.json({ question: rows[0] }, 201);
});

// PATCH /admin/questions/:id — update any field; translations are merged (JSONB ||)
const updateQuestionSchema = z.object({
  text:         z.string().trim().min(1).optional(),
  category_id:  z.string().uuid().optional(),
  sort_order:   z.number().int().min(0).optional(),
  is_active:    z.boolean().optional(),
  translations: z.record(z.string()).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

admin.patch("/questions/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateQuestionSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  const d = body.data;

  if (d.category_id) {
    const catRows = await sql`SELECT id FROM question_categories WHERE id = ${d.category_id}`;
    if (catRows.length === 0) return c.json({ error: "Category not found" }, 404);
  }

  const translationsJSON = d.translations ? JSON.stringify(d.translations) : null;
  const rows = await sql`
    UPDATE questions SET
      text         = COALESCE(${d.text        ?? null}, text),
      category_id  = COALESCE(${d.category_id ?? null}, category_id),
      sort_order   = COALESCE(${d.sort_order  ?? null}, sort_order),
      is_active    = COALESCE(${d.is_active   ?? null}, is_active),
      translations = CASE WHEN ${translationsJSON} IS NOT NULL THEN translations || ${translationsJSON}::jsonb ELSE translations END,
      updated_at   = now()
    WHERE id = ${id}
    RETURNING id, text, category_id, sort_order, is_active, translations, created_at, updated_at
  `;

  if (rows.length === 0) return c.json({ error: "Question not found" }, 404);
  return c.json({ question: rows[0] });
});

// DELETE /admin/questions/:id — delete
admin.delete("/questions/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await sql`DELETE FROM questions WHERE id = ${id} RETURNING id`;
  if (rows.length === 0) return c.json({ error: "Question not found" }, 404);
  return c.json({ success: true });
});

// POST /admin/questions/reorder — bulk update sort_order within category
admin.post("/questions/reorder", async (c) => {
  const body = reorderSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  for (const { id, sort_order } of body.data.orders) {
    await sql`
      UPDATE questions
      SET sort_order = ${sort_order}, updated_at = now()
      WHERE id = ${id}
    `;
  }

  return c.json({ success: true });
});

export { admin as adminRoute };
