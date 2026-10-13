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

// ─── Blog Posts ───────────────────────────────────────────────────────────────
//
// Required DB table (run once in Neon console):
//
// CREATE TABLE IF NOT EXISTS blog_posts (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   slug TEXT UNIQUE NOT NULL,
//   status TEXT NOT NULL DEFAULT 'draft',
//   title TEXT NOT NULL,
//   search_title TEXT,
//   description TEXT,
//   excerpt TEXT,
//   topic TEXT NOT NULL DEFAULT 'voice',
//   reading_time TEXT,
//   author TEXT NOT NULL DEFAULT 'The ÉCHO Team',
//   in_short TEXT,
//   card_visual JSONB NOT NULL DEFAULT '{"type":"image"}',
//   sections JSONB NOT NULL DEFAULT '[]',
//   related_slugs TEXT[] NOT NULL DEFAULT '{}',
//   seo_og_image TEXT,
//   seo_canonical_url TEXT,
//   published_at TIMESTAMPTZ,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

interface BlogPostRow {
  id: string;
  slug: string;
  status: string;
  title: string;
  search_title: string | null;
  description: string | null;
  excerpt: string | null;
  topic: string;
  reading_time: string | null;
  author: string;
  in_short: string | null;
  card_visual: Record<string, unknown>;
  sections: Record<string, unknown>[];
  related_slugs: string[];
  seo_og_image: string | null;
  seo_canonical_url: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const blogTopics = ["voice", "prompts", "reflect", "privacy"] as const;

const createBlogPostSchema = z.object({
  slug:             z.string().trim().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens"),
  title:            z.string().trim().min(1),
  search_title:     z.string().nullable().optional(),
  description:      z.string().nullable().optional(),
  excerpt:          z.string().nullable().optional(),
  topic:            z.enum(blogTopics),
  reading_time:     z.string().nullable().optional(),
  author:           z.string().trim().min(1).optional(),
  in_short:         z.string().nullable().optional(),
  card_visual:      z.record(z.unknown()).optional(),
  sections:         z.array(z.record(z.unknown())).optional(),
  related_slugs:    z.array(z.string()).optional(),
  seo_og_image:     z.string().nullable().optional(),
  seo_canonical_url: z.string().nullable().optional(),
});

const updateBlogPostSchema = createBlogPostSchema.partial().refine(
  (d) => Object.keys(d).length > 0,
  { message: "No fields to update" },
);

// GET /admin/blog — list all posts (summary, no sections)
admin.get("/blog", async (c) => {
  const rows = await sql`
    SELECT id, slug, status, title, topic, reading_time, author, excerpt,
           published_at, created_at, updated_at
    FROM blog_posts
    ORDER BY updated_at DESC
  `;
  return c.json({ posts: rows });
});

// POST /admin/blog — create a new post (draft by default)
admin.post("/blog", async (c) => {
  const body = createBlogPostSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  const {
    slug, title, search_title = null, description = null, excerpt = null,
    topic, reading_time = null, author = "The ÉCHO Team", in_short = null,
    card_visual = { type: "image" }, sections = [], related_slugs = [],
    seo_og_image = null, seo_canonical_url = null,
  } = body.data;

  const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${slug}`;
  if (existing.length > 0) return c.json({ error: "A post with this slug already exists" }, 409);

  const rows = await sql`
    INSERT INTO blog_posts (
      slug, title, search_title, description, excerpt, topic, reading_time, author,
      in_short, card_visual, sections, related_slugs, seo_og_image, seo_canonical_url
    ) VALUES (
      ${slug}, ${title}, ${search_title}, ${description}, ${excerpt},
      ${topic}, ${reading_time}, ${author}, ${in_short},
      ${JSON.stringify(card_visual)}::jsonb,
      ${JSON.stringify(sections)}::jsonb,
      ${related_slugs},
      ${seo_og_image}, ${seo_canonical_url}
    )
    RETURNING *
  `;
  return c.json({ post: rows[0] as BlogPostRow }, 201);
});

// GET /admin/blog/:id — get full post by ID
admin.get("/blog/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id}`;
  if (rows.length === 0) return c.json({ error: "Post not found" }, 404);
  return c.json({ post: rows[0] as BlogPostRow });
});

// PATCH /admin/blog/:id — update any field
admin.patch("/blog/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateBlogPostSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!body.success) return c.json({ error: body.error.issues[0]!.message }, 400);

  const d = body.data;

  if (d.slug) {
    const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${d.slug} AND id != ${id}`;
    if (existing.length > 0) return c.json({ error: "A post with this slug already exists" }, 409);
  }

  const cardVisualJSON = d.card_visual != null ? JSON.stringify(d.card_visual) : null;
  const sectionsJSON   = d.sections    != null ? JSON.stringify(d.sections)    : null;

  const rows = await sql`
    UPDATE blog_posts SET
      slug              = COALESCE(${d.slug              ?? null}, slug),
      title             = COALESCE(${d.title             ?? null}, title),
      search_title      = CASE WHEN ${d.search_title     !== undefined} THEN ${d.search_title     ?? null} ELSE search_title END,
      description       = CASE WHEN ${d.description      !== undefined} THEN ${d.description      ?? null} ELSE description END,
      excerpt           = CASE WHEN ${d.excerpt           !== undefined} THEN ${d.excerpt           ?? null} ELSE excerpt END,
      topic             = COALESCE(${d.topic             ?? null}, topic),
      reading_time      = CASE WHEN ${d.reading_time     !== undefined} THEN ${d.reading_time     ?? null} ELSE reading_time END,
      author            = COALESCE(${d.author            ?? null}, author),
      in_short          = CASE WHEN ${d.in_short         !== undefined} THEN ${d.in_short         ?? null} ELSE in_short END,
      card_visual       = CASE WHEN ${cardVisualJSON}    IS NOT NULL THEN ${cardVisualJSON}::jsonb ELSE card_visual END,
      sections          = CASE WHEN ${sectionsJSON}      IS NOT NULL THEN ${sectionsJSON}::jsonb   ELSE sections END,
      related_slugs     = COALESCE(${d.related_slugs     ?? null}, related_slugs),
      seo_og_image      = CASE WHEN ${d.seo_og_image     !== undefined} THEN ${d.seo_og_image     ?? null} ELSE seo_og_image END,
      seo_canonical_url = CASE WHEN ${d.seo_canonical_url !== undefined} THEN ${d.seo_canonical_url ?? null} ELSE seo_canonical_url END,
      updated_at        = now()
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) return c.json({ error: "Post not found" }, 404);
  return c.json({ post: rows[0] as BlogPostRow });
});

// POST /admin/blog/:id/publish — set status = published
admin.post("/blog/:id/publish", async (c) => {
  const id = c.req.param("id");
  const rows = await sql`
    UPDATE blog_posts
    SET status = 'published', published_at = COALESCE(published_at, now()), updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) return c.json({ error: "Post not found" }, 404);
  return c.json({ post: rows[0] as BlogPostRow });
});

// POST /admin/blog/:id/unpublish — set status = draft
admin.post("/blog/:id/unpublish", async (c) => {
  const id = c.req.param("id");
  const rows = await sql`
    UPDATE blog_posts
    SET status = 'draft', updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  if (rows.length === 0) return c.json({ error: "Post not found" }, 404);
  return c.json({ post: rows[0] as BlogPostRow });
});

// DELETE /admin/blog/:id — delete post permanently
admin.delete("/blog/:id", async (c) => {
  const id = c.req.param("id");
  const rows = await sql`DELETE FROM blog_posts WHERE id = ${id} RETURNING id`;
  if (rows.length === 0) return c.json({ error: "Post not found" }, 404);
  return c.json({ success: true });
});

export { admin as adminRoute };
