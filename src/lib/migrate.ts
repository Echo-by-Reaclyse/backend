import { sql } from "./db.js";

// ─── Schema migrations ────────────────────────────────────────────────────────

async function runSchemaMigrations(): Promise<void> {
  // Add role column to users (idempotent)
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  `;

  // question_categories
  await sql`
    CREATE TABLE IF NOT EXISTS question_categories (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // questions
  await sql`
    CREATE TABLE IF NOT EXISTS questions (
      id          TEXT PRIMARY KEY,
      text        TEXT NOT NULL,
      category_id UUID NOT NULL REFERENCES question_categories(id) ON DELETE CASCADE,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_active   BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

interface CategorySeed {
  slug: string;
  name: string;
  sort_order: number;
}

const CATEGORIES: CategorySeed[] = [
  { slug: "identity",      name: "Identity",      sort_order: 0 },
  { slug: "decisions",     name: "Decisions",     sort_order: 1 },
  { slug: "relationships", name: "Relationships", sort_order: 2 },
  { slug: "fear",          name: "Fear",          sort_order: 3 },
  { slug: "gratitude",     name: "Gratitude",     sort_order: 4 },
  { slug: "future",        name: "Future",        sort_order: 5 },
  { slug: "creativity",    name: "Creativity",    sort_order: 6 },
  { slug: "freeform",      name: "Freeform",      sort_order: 7 },
];

interface QuestionSeed {
  id: string;
  text: string;
  category_slug: string;
  sort_order: number;
}

const QUESTIONS: QuestionSeed[] = [
  // identity (12)
  { id: "q001", text: "How would you describe yourself in three words?",                         category_slug: "identity",      sort_order: 0  },
  { id: "q002", text: "What is one value that defines who you are?",                             category_slug: "identity",      sort_order: 1  },
  { id: "q003", text: "What did you learn about yourself today?",                                category_slug: "identity",      sort_order: 2  },
  { id: "q004", text: "When do you feel most like yourself?",                                    category_slug: "identity",      sort_order: 3  },
  { id: "q005", text: "What part of your identity are you most proud of?",                       category_slug: "identity",      sort_order: 4  },
  { id: "q006", text: "How has your perspective on yourself changed recently?",                  category_slug: "identity",      sort_order: 5  },
  { id: "q007", text: "What role do you most naturally play in groups?",                         category_slug: "identity",      sort_order: 6  },
  { id: "q008", text: "What strengths do others see in you that you sometimes miss?",            category_slug: "identity",      sort_order: 7  },
  { id: "q009", text: "How do you want to be remembered?",                                       category_slug: "identity",      sort_order: 8  },
  { id: "q010", text: "What does authenticity mean to you?",                                     category_slug: "identity",      sort_order: 9  },
  { id: "q011", text: "When were you most true to yourself lately?",                             category_slug: "identity",      sort_order: 10 },
  { id: "q012", text: "What mask do you wear most often, and why?",                              category_slug: "identity",      sort_order: 11 },
  // decisions (11)
  { id: "q013", text: "What difficult decision are you facing?",                                 category_slug: "decisions",     sort_order: 0  },
  { id: "q014", text: "What would the courageous version of you do?",                            category_slug: "decisions",     sort_order: 1  },
  { id: "q015", text: "What choice aligned with your values today?",                             category_slug: "decisions",     sort_order: 2  },
  { id: "q016", text: "What decision have you been avoiding?",                                   category_slug: "decisions",     sort_order: 3  },
  { id: "q017", text: "How do you typically make important decisions?",                          category_slug: "decisions",     sort_order: 4  },
  { id: "q018", text: "What would you do if you weren't afraid?",                                category_slug: "decisions",     sort_order: 5  },
  { id: "q019", text: "When did you trust your gut today?",                                      category_slug: "decisions",     sort_order: 6  },
  { id: "q020", text: "What option are you not giving enough consideration?",                    category_slug: "decisions",     sort_order: 7  },
  { id: "q021", text: "How did today's choices shape who you're becoming?",                      category_slug: "decisions",     sort_order: 8  },
  { id: "q022", text: "What would a wise mentor suggest about your dilemma?",                    category_slug: "decisions",     sort_order: 9  },
  { id: "q023", text: "How does this decision reflect your priorities?",                         category_slug: "decisions",     sort_order: 10 },
  // relationships (11)
  { id: "q024", text: "Who made you feel truly seen today?",                                     category_slug: "relationships", sort_order: 0  },
  { id: "q025", text: "What relationship would you like to deepen?",                             category_slug: "relationships", sort_order: 1  },
  { id: "q026", text: "How did you show up for someone today?",                                  category_slug: "relationships", sort_order: 2  },
  { id: "q027", text: "What unspoken feeling would you like to share with someone?",             category_slug: "relationships", sort_order: 3  },
  { id: "q028", text: "When did you feel disconnected today, and from whom?",                    category_slug: "relationships", sort_order: 4  },
  { id: "q029", text: "What does belonging mean to you?",                                        category_slug: "relationships", sort_order: 5  },
  { id: "q030", text: "Who brings out the best version of you?",                                 category_slug: "relationships", sort_order: 6  },
  { id: "q031", text: "How can you be a better friend or partner?",                              category_slug: "relationships", sort_order: 7  },
  { id: "q032", text: "What conflict needs your attention?",                                     category_slug: "relationships", sort_order: 8  },
  { id: "q033", text: "When did you feel most connected today?",                                 category_slug: "relationships", sort_order: 9  },
  { id: "q034", text: "What boundaries do you need to set?",                                     category_slug: "relationships", sort_order: 10 },
  // fear (11)
  { id: "q035", text: "What fear held you back today?",                                          category_slug: "fear",          sort_order: 0  },
  { id: "q036", text: "What would you attempt if you knew you couldn't fail?",                   category_slug: "fear",          sort_order: 1  },
  { id: "q037", text: "What risk are you considering?",                                          category_slug: "fear",          sort_order: 2  },
  { id: "q038", text: "When did you feel brave today?",                                          category_slug: "fear",          sort_order: 3  },
  { id: "q039", text: "What belief about yourself is holding you back?",                         category_slug: "fear",          sort_order: 4  },
  { id: "q040", text: "What would you do differently if you were fearless?",                     category_slug: "fear",          sort_order: 5  },
  { id: "q041", text: "What small step could you take toward your fear?",                        category_slug: "fear",          sort_order: 6  },
  { id: "q042", text: "When have you overcome a similar fear before?",                           category_slug: "fear",          sort_order: 7  },
  { id: "q043", text: "What are you most afraid of losing?",                                     category_slug: "fear",          sort_order: 8  },
  { id: "q044", text: "What scares you about growing?",                                          category_slug: "fear",          sort_order: 9  },
  { id: "q045", text: "How could this fear actually be serving you?",                            category_slug: "fear",          sort_order: 10 },
  // gratitude (12)
  { id: "q046", text: "What are you grateful for today?",                                        category_slug: "gratitude",     sort_order: 0  },
  { id: "q047", text: "Who are you thankful for, and why?",                                      category_slug: "gratitude",     sort_order: 1  },
  { id: "q048", text: "What small moment brought you joy?",                                      category_slug: "gratitude",     sort_order: 2  },
  { id: "q049", text: "What privilege do you often overlook?",                                   category_slug: "gratitude",     sort_order: 3  },
  { id: "q050", text: "What do you appreciate about yourself?",                                  category_slug: "gratitude",     sort_order: 4  },
  { id: "q051", text: "How did someone show care for you?",                                      category_slug: "gratitude",     sort_order: 5  },
  { id: "q052", text: "What am I taking for granted?",                                           category_slug: "gratitude",     sort_order: 6  },
  { id: "q053", text: "What challenge taught you something valuable?",                           category_slug: "gratitude",     sort_order: 7  },
  { id: "q054", text: "What are you most abundant in?",                                          category_slug: "gratitude",     sort_order: 8  },
  { id: "q055", text: "How has a difficult person changed you for the better?",                  category_slug: "gratitude",     sort_order: 9  },
  { id: "q056", text: "What unexpected gift did today bring?",                                   category_slug: "gratitude",     sort_order: 10 },
  { id: "q057", text: "What are you genuinely thankful you didn't get?",                         category_slug: "gratitude",     sort_order: 11 },
  // future (12)
  { id: "q058", text: "What are you building toward?",                                           category_slug: "future",        sort_order: 0  },
  { id: "q059", text: "What would your ideal day look like in five years?",                      category_slug: "future",        sort_order: 1  },
  { id: "q060", text: "What legacy do you want to leave?",                                       category_slug: "future",        sort_order: 2  },
  { id: "q061", text: "What skill would you like to develop?",                                   category_slug: "future",        sort_order: 3  },
  { id: "q062", text: "What possibility excites you most?",                                      category_slug: "future",        sort_order: 4  },
  { id: "q063", text: "How do you want to grow?",                                                category_slug: "future",        sort_order: 5  },
  { id: "q064", text: "What dream have you been putting off?",                                   category_slug: "future",        sort_order: 6  },
  { id: "q065", text: "What milestone matters most to you?",                                     category_slug: "future",        sort_order: 7  },
  { id: "q066", text: "Who do you want to become?",                                              category_slug: "future",        sort_order: 8  },
  { id: "q067", text: "What would your future self thank you for today?",                        category_slug: "future",        sort_order: 9  },
  { id: "q068", text: "What are you planting seeds for?",                                        category_slug: "future",        sort_order: 10 },
  { id: "q069", text: "What does success mean to you five years from now?",                      category_slug: "future",        sort_order: 11 },
  // creativity (11)
  { id: "q070", text: "How did you express yourself today?",                                     category_slug: "creativity",    sort_order: 0  },
  { id: "q071", text: "What brings out your creative side?",                                     category_slug: "creativity",    sort_order: 1  },
  { id: "q072", text: "What would you create if judgment didn't exist?",                         category_slug: "creativity",    sort_order: 2  },
  { id: "q073", text: "When did you feel most playful?",                                         category_slug: "creativity",    sort_order: 3  },
  { id: "q074", text: "What creative passion have you abandoned?",                               category_slug: "creativity",    sort_order: 4  },
  { id: "q075", text: "What inspires you?",                                                      category_slug: "creativity",    sort_order: 5  },
  { id: "q076", text: "What would you try if you weren't worried about looking silly?",          category_slug: "creativity",    sort_order: 6  },
  { id: "q077", text: "How do you currently express your unique perspective?",                   category_slug: "creativity",    sort_order: 7  },
  { id: "q078", text: "What experimental step could you take?",                                  category_slug: "creativity",    sort_order: 8  },
  { id: "q079", text: "What art form calls to you?",                                             category_slug: "creativity",    sort_order: 9  },
  { id: "q080", text: "How can you bring more creativity into your life?",                       category_slug: "creativity",    sort_order: 10 },
  // freeform (10)
  { id: "q081", text: "What did today teach you?",                                               category_slug: "freeform",      sort_order: 0  },
  { id: "q082", text: "What surprised you today?",                                               category_slug: "freeform",      sort_order: 1  },
  { id: "q083", text: "What would you want to remember about today?",                            category_slug: "freeform",      sort_order: 2  },
  { id: "q084", text: "If today were a chapter, what would its title be?",                       category_slug: "freeform",      sort_order: 3  },
  { id: "q085", text: "What are you still processing?",                                          category_slug: "freeform",      sort_order: 4  },
  { id: "q086", text: "What feels unfinished?",                                                  category_slug: "freeform",      sort_order: 5  },
  { id: "q087", text: "What moment do you wish you could relive?",                               category_slug: "freeform",      sort_order: 6  },
  { id: "q088", text: "What conversation is lingering with you?",                                category_slug: "freeform",      sort_order: 7  },
  { id: "q089", text: "What are you noticing about your patterns?",                              category_slug: "freeform",      sort_order: 8  },
  { id: "q090", text: "What will you do differently tomorrow?",                                  category_slug: "freeform",      sort_order: 9  },
];

async function seedCategories(): Promise<void> {
  for (const cat of CATEGORIES) {
    await sql`
      INSERT INTO question_categories (name, slug, sort_order)
      VALUES (${cat.name}, ${cat.slug}, ${cat.sort_order})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}

async function seedQuestions(): Promise<void> {
  // Fetch the slug→id map once
  const rows = await sql`SELECT id, slug FROM question_categories`;
  const slugToId = new Map<string, string>(
    (rows as { id: string; slug: string }[]).map((r) => [r.slug, r.id])
  );

  for (const q of QUESTIONS) {
    const categoryId = slugToId.get(q.category_slug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${q.category_slug}`);
    }
    await sql`
      INSERT INTO questions (id, text, category_id, sort_order)
      VALUES (${q.id}, ${q.text}, ${categoryId}, ${q.sort_order})
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runMigrations(): Promise<void> {
  console.log("[migrate] running schema migrations…");
  await runSchemaMigrations();
  console.log("[migrate] schema OK");

  console.log("[migrate] seeding categories…");
  await seedCategories();
  console.log("[migrate] categories OK");

  console.log("[migrate] seeding questions…");
  await seedQuestions();
  console.log("[migrate] questions OK");

  console.log("[migrate] all done");
}
