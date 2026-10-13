import { Hono } from "hono";
import { sql } from "../lib/db.js";

const blog = new Hono();

// GET /blog/posts — list all published posts (summary, no sections)
blog.get("/posts", async (c) => {
  const rows = await sql`
    SELECT id, slug, status, title, search_title, description, excerpt, topic,
           reading_time, author, in_short, card_visual, related_slugs,
           seo_og_image, seo_canonical_url, published_at, created_at, updated_at
    FROM blog_posts
    WHERE status = 'published'
    ORDER BY published_at DESC
  `;
  return c.json({ posts: rows });
});

// GET /blog/posts/:slug — get a single published post by slug (full, with sections)
blog.get("/posts/:slug", async (c) => {
  const slug = c.req.param("slug");
  const rows = await sql`
    SELECT * FROM blog_posts
    WHERE slug = ${slug} AND status = 'published'
  `;
  if (rows.length === 0) return c.json({ error: "Post not found" }, 404);
  return c.json({ post: rows[0] });
});

export { blog as blogRoute };
