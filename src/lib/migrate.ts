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

  // translations columns (idempotent)
  await sql`
    ALTER TABLE question_categories
      ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'
  `;
  await sql`
    ALTER TABLE questions
      ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'
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

// ─── Translation seed data ────────────────────────────────────────────────────

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  identity:      { ar: "الهوية",         de: "Identität",    es: "Identidad",       fr: "Identité",          it: "Identità",       ja: "アイデンティティ", ko: "정체성",    pl: "Tożsamość",      pt: "Identidade",      ro: "Identitate",      ru: "Идентичность",  "zh-Hans": "身份认同" },
  decisions:     { ar: "القرارات",        de: "Entscheidungen", es: "Decisiones",    fr: "Décisions",         it: "Decisioni",      ja: "決断",           ko: "결정",      pl: "Decyzje",        pt: "Decisões",        ro: "Decizii",         ru: "Решения",       "zh-Hans": "决策" },
  relationships: { ar: "العلاقات",        de: "Beziehungen",  es: "Relaciones",      fr: "Relations",         it: "Relazioni",      ja: "人間関係",        ko: "관계",      pl: "Relacje",        pt: "Relacionamentos", ro: "Relații",         ru: "Отношения",     "zh-Hans": "人际关系" },
  fear:          { ar: "الخوف",           de: "Angst",         es: "Miedo",          fr: "Peur",              it: "Paura",          ja: "恐れ",            ko: "두려움",    pl: "Strach",         pt: "Medo",            ro: "Frică",           ru: "Страх",         "zh-Hans": "恐惧" },
  gratitude:     { ar: "الامتنان",        de: "Dankbarkeit",  es: "Gratitud",        fr: "Gratitude",         it: "Gratitudine",    ja: "感謝",            ko: "감사",      pl: "Wdzięczność",    pt: "Gratidão",        ro: "Recunoștință",    ru: "Благодарность", "zh-Hans": "感恩" },
  future:        { ar: "المستقبل",        de: "Zukunft",       es: "Futuro",         fr: "Avenir",            it: "Futuro",         ja: "未来",            ko: "미래",      pl: "Przyszłość",     pt: "Futuro",          ro: "Viitor",          ru: "Будущее",       "zh-Hans": "未来" },
  creativity:    { ar: "الإبداع",         de: "Kreativität",  es: "Creatividad",     fr: "Créativité",        it: "Creatività",     ja: "創造性",          ko: "창의성",    pl: "Kreatywność",    pt: "Criatividade",    ro: "Creativitate",    ru: "Творчество",    "zh-Hans": "创造力" },
  freeform:      { ar: "حر التعبير",      de: "Freie Form",   es: "Forma libre",     fr: "Libre expression",  it: "Forma libera",   ja: "自由形式",        ko: "자유 형식", pl: "Forma swobodna", pt: "Livre expressão", ro: "Formă liberă",    ru: "Свободная форма","zh-Hans": "自由表达" },
};

const QUESTION_TRANSLATIONS: Record<string, Record<string, string>> = {
  // ── Identity ──────────────────────────────────────────────────────────────────
  q001: { ar: "كيف ستصف نفسك بثلاث كلمات؟", de: "Wie würdest du dich in drei Worten beschreiben?", es: "¿Cómo te describirías en tres palabras?", fr: "Comment vous décririez-vous en trois mots ?", it: "Come ti descriveresti in tre parole?", ja: "三つの言葉で自分自身をどう表現しますか？", ko: "세 단어로 자신을 어떻게 표현하시겠습니까?", pl: "Jak opisałbyś siebie w trzech słowach?", pt: "Como você se descreveria em três palavras?", ro: "Cum te-ai descrie în trei cuvinte?", ru: "Как бы ты описал себя тремя словами?", "zh-Hans": "你会用三个词怎么描述自己？" },
  q002: { ar: "ما هي قيمة واحدة تُعرِّف من أنت؟", de: "Welcher Wert definiert, wer du bist?", es: "¿Cuál es un valor que define quién eres?", fr: "Quelle est la valeur qui vous définit ?", it: "Qual è un valore che definisce chi sei?", ja: "あなたが何者であるかを定義する価値観は何ですか？", ko: "당신이 누구인지를 정의하는 하나의 가치는 무엇입니까?", pl: "Jaka wartość definiuje to, kim jesteś?", pt: "Qual é um valor que define quem você é?", ro: "Care este o valoare care te definește pe tine?", ru: "Какая ценность определяет то, кто ты есть?", "zh-Hans": "有哪一个价值观定义了你是谁？" },
  q003: { ar: "ماذا تعلمت عن نفسك اليوم؟", de: "Was hast du heute über dich selbst gelernt?", es: "¿Qué aprendiste sobre ti mismo hoy?", fr: "Qu'avez-vous appris sur vous-même aujourd'hui ?", it: "Cosa hai imparato di te stesso oggi?", ja: "今日、自分自身について何を学びましたか？", ko: "오늘 자신에 대해 무엇을 배웠습니까?", pl: "Czego dziś dowiedziałeś się o sobie?", pt: "O que você aprendeu sobre si mesmo hoje?", ro: "Ce ai aflat azi despre tine însuți?", ru: "Что ты узнал о себе сегодня?", "zh-Hans": "今天你对自己有什么了解？" },
  q004: { ar: "متى تشعر أنك أكثر قدرة على أن تكون نفسك؟", de: "Wann fühlst du dich am meisten wie du selbst?", es: "¿Cuándo te sientes más tú mismo?", fr: "Quand vous sentez-vous le plus vous-même ?", it: "Quando ti senti più te stesso?", ja: "いつ最も自分らしいと感じますか？", ko: "언제 가장 자신답다고 느끼십니까?", pl: "Kiedy czujesz się najbardziej sobą?", pt: "Quando você se sente mais você mesmo?", ro: "Când te simți cel mai mult tu însuți?", ru: "Когда ты чувствуешь себя наиболее собой?", "zh-Hans": "什么时候你感觉最像自己？" },
  q005: { ar: "ما الجزء من هويتك الذي تفخر به أكثر؟", de: "Auf welchen Teil deiner Identität bist du am stolzesten?", es: "¿De qué parte de tu identidad estás más orgulloso?", fr: "De quelle partie de votre identité êtes-vous le plus fier ?", it: "Di quale parte della tua identità sei più orgoglioso?", ja: "あなたのアイデンティティのどの部分が最も誇りですか？", ko: "당신의 정체성 중 어떤 부분이 가장 자랑스럽습니까?", pl: "Z której części swojej tożsamości jesteś najbardziej dumny?", pt: "De qual parte da sua identidade você tem mais orgulho?", ro: "De ce parte a identității tale ești cel mai mândru?", ru: "Какой частью своей личности ты гордишься больше всего?", "zh-Hans": "你最为自己身份的哪个方面感到自豪？" },
  q006: { ar: "كيف تغيرت نظرتك لنفسك مؤخراً؟", de: "Wie hat sich deine Sichtweise auf dich selbst in letzter Zeit verändert?", es: "¿Cómo ha cambiado tu perspectiva sobre ti mismo recientemente?", fr: "Comment votre perception de vous-même a-t-elle changé récemment ?", it: "Come è cambiata di recente la tua prospettiva su te stesso?", ja: "最近、自分自身に対する見方はどのように変わりましたか？", ko: "최근 자신에 대한 시각이 어떻게 바뀌었습니까?", pl: "Jak ostatnio zmieniła się twoja perspektywa na siebie?", pt: "Como sua perspectiva sobre si mesmo mudou recentemente?", ro: "Cum s-a schimbat recent perspectiva ta despre tine însuți?", ru: "Как недавно изменилось твоё восприятие самого себя?", "zh-Hans": "最近你对自己的看法有什么变化？" },
  q007: { ar: "ما الدور الذي تلعبه بشكل طبيعي في المجموعات؟", de: "Welche Rolle spielst du in Gruppen am natürlichsten?", es: "¿Qué papel juegas más naturalmente en los grupos?", fr: "Quel rôle jouez-vous le plus naturellement dans les groupes ?", it: "Quale ruolo giochi più naturalmente nei gruppi?", ja: "グループの中で最も自然に担う役割は何ですか？", ko: "그룹에서 가장 자연스럽게 맡는 역할은 무엇입니까?", pl: "Jaką rolę najnaturalniej odgrywasz w grupach?", pt: "Que papel você desempenha mais naturalmente em grupos?", ro: "Ce rol joci cel mai natural în grupuri?", ru: "Какую роль ты наиболее естественно играешь в группах?", "zh-Hans": "你在群体中最自然地扮演什么角色？" },
  q008: { ar: "ما هي نقاط القوة التي يراها الآخرون فيك وأنت أحياناً تتجاهلها؟", de: "Welche Stärken sehen andere in dir, die du manchmal übersiehst?", es: "¿Qué fortalezas ven los demás en ti que a veces no ves?", fr: "Quelles forces les autres voient-ils en vous que vous négligez parfois ?", it: "Quali punti di forza vedono gli altri in te che a volte ti sfuggono?", ja: "他の人があなたに見る強みで、あなた自身が見落としがちなものは何ですか？", ko: "다른 사람들이 당신에게서 보는, 당신이 때로 놓치는 강점은 무엇입니까?", pl: "Jakie mocne strony widzą w tobie inni, a ty czasem je pomijasz?", pt: "Quais pontos fortes os outros veem em você que às vezes você perde?", ro: "Ce calități văd alții în tine pe care tu uneori le ignori?", ru: "Какие сильные стороны видят в тебе другие, но ты сам иногда не замечаешь?", "zh-Hans": "别人看到你身上的哪些优点是你自己有时忽略的？" },
  q009: { ar: "كيف تريد أن يتذكرك الناس؟", de: "Wie möchtest du in Erinnerung bleiben?", es: "¿Cómo quieres ser recordado?", fr: "Comment voulez-vous être mémorisé ?", it: "Come vuoi essere ricordato?", ja: "あなたはどのように記憶されたいですか？", ko: "어떻게 기억되고 싶습니까?", pl: "Jak chcesz być zapamiętany?", pt: "Como você quer ser lembrado?", ro: "Cum vrei să fii amintit?", ru: "Как ты хочешь, чтобы тебя помнили?", "zh-Hans": "你希望别人如何记住你？" },
  q010: { ar: "ماذا تعني لك الأصالة؟", de: "Was bedeutet Authentizität für dich?", es: "¿Qué significa la autenticidad para ti?", fr: "Que signifie l'authenticité pour vous ?", it: "Cosa significa l'autenticità per te?", ja: "真正性はあなたにとって何を意味しますか？", ko: "진정성은 당신에게 무엇을 의미합니까?", pl: "Co dla ciebie oznacza autentyczność?", pt: "O que significa autenticidade para você?", ro: "Ce înseamnă autenticitatea pentru tine?", ru: "Что для тебя означает подлинность?", "zh-Hans": "真实性对你意味着什么？" },
  q011: { ar: "متى كنت أكثر صدقاً مع نفسك مؤخراً؟", de: "Wann warst du zuletzt am ehrlichsten zu dir selbst?", es: "¿Cuándo fuiste más fiel a ti mismo últimamente?", fr: "Quand avez-vous été le plus fidèle à vous-même récemment ?", it: "Quando sei stato più fedele a te stesso di recente?", ja: "最近、最も自分に正直だったのはいつですか？", ko: "최근에 가장 자신에게 충실했던 때는 언제였습니까?", pl: "Kiedy ostatnio byłeś najbardziej sobą?", pt: "Quando você foi mais fiel a si mesmo recentemente?", ro: "Când ai fost cel mai fidel ție însuți în ultima vreme?", ru: "Когда ты в последнее время был наиболее верен себе?", "zh-Hans": "最近你什么时候最忠于自己？" },
  q012: { ar: "ما القناع الذي ترتديه في أغلب الأحيان، ولماذا؟", de: "Welche Maske trägst du am häufigsten, und warum?", es: "¿Qué máscara usas con más frecuencia, y por qué?", fr: "Quel masque portez-vous le plus souvent, et pourquoi ?", it: "Quale maschera indossi più spesso, e perché?", ja: "最もよく着けている仮面は何ですか？そしてなぜですか？", ko: "가장 자주 쓰는 가면은 무엇이며, 왜 그렇습니까?", pl: "Jaką maskę nosisz najczęściej i dlaczego?", pt: "Qual máscara você usa com mais frequência e por quê?", ro: "Ce mască porți cel mai des și de ce?", ru: "Какую маску ты носишь чаще всего, и почему?", "zh-Hans": "你最常戴什么面具，为什么？" },
  // ── Decisions ─────────────────────────────────────────────────────────────────
  q013: { ar: "ما القرار الصعب الذي تواجهه؟", de: "Welche schwierige Entscheidung stehst du gerade gegenüber?", es: "¿Qué decisión difícil estás enfrentando?", fr: "Quelle décision difficile êtes-vous en train de prendre ?", it: "Quale decisione difficile stai affrontando?", ja: "今直面している難しい決断は何ですか？", ko: "어떤 어려운 결정에 직면해 있습니까?", pl: "Przed jaką trudną decyzją stoisz?", pt: "Qual decisão difícil você está enfrentando?", ro: "Ce decizie dificilă te confrunți?", ru: "С каким трудным решением ты сталкиваешься?", "zh-Hans": "你正面临什么艰难决定？" },
  q014: { ar: "ماذا سيفعل الإصدار الشجاع منك؟", de: "Was würde die mutige Version von dir tun?", es: "¿Qué haría la versión valiente de ti?", fr: "Que ferait la version courageuse de vous ?", it: "Cosa farebbe la versione coraggiosa di te?", ja: "勇敢なあなたはどうするでしょうか？", ko: "용기 있는 버전의 당신은 무엇을 할 것입니까?", pl: "Co zrobiłaby odważna wersja ciebie?", pt: "O que a versão corajosa de você faria?", ro: "Ce ar face versiunea curajoasă a ta?", ru: "Что бы сделала смелая версия тебя?", "zh-Hans": "勇敢的你会怎么做？" },
  q015: { ar: "ما الاختيار الذي توافق مع قيمك اليوم؟", de: "Welche Entscheidung stimmte heute mit deinen Werten überein?", es: "¿Qué elección estuvo alineada con tus valores hoy?", fr: "Quel choix était aligné avec vos valeurs aujourd'hui ?", it: "Quale scelta è stata allineata con i tuoi valori oggi?", ja: "今日、あなたの価値観に沿った選択は何でしたか？", ko: "오늘 당신의 가치관과 일치하는 선택은 무엇이었습니까?", pl: "Jaki wybór był dzisiaj zgodny z twoimi wartościami?", pt: "Qual escolha foi alinhada com seus valores hoje?", ro: "Ce alegere s-a aliniat cu valorile tale azi?", ru: "Какой выбор сегодня соответствовал твоим ценностям?", "zh-Hans": "今天哪个选择与你的价值观相符？" },
  q016: { ar: "ما القرار الذي كنت تتجنبه؟", de: "Welche Entscheidung hast du vermieden?", es: "¿Qué decisión has estado evitando?", fr: "Quelle décision avez-vous évitée ?", it: "Quale decisione stai evitando?", ja: "避けてきた決断は何ですか？", ko: "어떤 결정을 회피해 왔습니까?", pl: "Jakiej decyzji unikałeś?", pt: "Qual decisão você tem evitado?", ro: "Ce decizie ai evitat?", ru: "Какое решение ты избегал?", "zh-Hans": "你一直在回避什么决定？" },
  q017: { ar: "كيف تتخذ القرارات المهمة عادةً؟", de: "Wie triffst du normalerweise wichtige Entscheidungen?", es: "¿Cómo sueles tomar decisiones importantes?", fr: "Comment prenez-vous généralement des décisions importantes ?", it: "Come prendi di solito le decisioni importanti?", ja: "重要な決断を通常どのように下しますか？", ko: "중요한 결정을 보통 어떻게 내립니까?", pl: "Jak zazwyczaj podejmujesz ważne decyzje?", pt: "Como você geralmente toma decisões importantes?", ro: "Cum iei de obicei decizii importante?", ru: "Как ты обычно принимаешь важные решения?", "zh-Hans": "你通常是如何做出重要决定的？" },
  q018: { ar: "ماذا ستفعل لو لم تكن خائفاً؟", de: "Was würdest du tun, wenn du keine Angst hättest?", es: "¿Qué harías si no tuvieras miedo?", fr: "Que feriez-vous si vous n'aviez pas peur ?", it: "Cosa faresti se non avessi paura?", ja: "恐れていなければ何をしますか？", ko: "두렵지 않다면 무엇을 하겠습니까?", pl: "Co byś zrobił, gdybyś się nie bał?", pt: "O que você faria se não tivesse medo?", ro: "Ce ai face dacă nu ți-ar fi frică?", ru: "Что бы ты сделал, если бы не боялся?", "zh-Hans": "如果你不害怕，你会做什么？" },
  q019: { ar: "متى اتبعت حدسك اليوم؟", de: "Wann hast du heute auf dein Bauchgefühl vertraut?", es: "¿Cuándo confiaste en tu instinto hoy?", fr: "Quand avez-vous fait confiance à votre instinct aujourd'hui ?", it: "Quando ti sei fidato del tuo istinto oggi?", ja: "今日、直感を信じたのはいつですか？", ko: "오늘 언제 직관을 믿었습니까?", pl: "Kiedy dziś zaufałeś swojemu instynktowi?", pt: "Quando você confiou no seu instinto hoje?", ro: "Când ți-ai urmat astăzi instinctul?", ru: "Когда сегодня ты доверился интуиции?", "zh-Hans": "今天你什么时候相信了自己的直觉？" },
  q020: { ar: "ما الخيار الذي لا تعطيه اعتباراً كافياً؟", de: "Welcher Option widmest du nicht genug Aufmerksamkeit?", es: "¿A qué opción no le estás dando suficiente consideración?", fr: "Quelle option ne prenez-vous pas suffisamment en compte ?", it: "Quale opzione non stai considerando abbastanza?", ja: "十分に考慮していない選択肢は何ですか？", ko: "충분히 고려하지 않는 선택지는 무엇입니까?", pl: "Jakiej opcji nie rozważasz wystarczająco?", pt: "Qual opção você não está considerando o suficiente?", ro: "Ce opțiune nu iei suficient în considerare?", ru: "Какому варианту ты не уделяешь достаточно внимания?", "zh-Hans": "你没有充分考虑哪个选项？" },
  q021: { ar: "كيف شكّلت خياراتك اليوم من أنت في طريقك لتصبح؟", de: "Wie haben die Entscheidungen von heute geprägt, wer du wirst?", es: "¿Cómo las decisiones de hoy moldearon en quién te estás convirtiendo?", fr: "Comment les choix d'aujourd'hui ont-ils façonné qui vous devenez ?", it: "Come hanno plasmato le scelte di oggi chi stai diventando?", ja: "今日の選択があなたがなりつつある人物をどのように形作りましたか？", ko: "오늘의 선택이 당신이 되어가는 사람을 어떻게 형성했습니까?", pl: "Jak dzisiejsze wybory kształtują to, kim się stajesz?", pt: "Como as escolhas de hoje moldaram quem você está se tornando?", ro: "Cum au modelat alegerile de azi persoana în care devii?", ru: "Как сегодняшние решения формируют того, кем ты становишься?", "zh-Hans": "今天的选择如何塑造了你正在成为的人？" },
  q022: { ar: "ماذا سيقترح مرشد حكيم بشأن معضلتك؟", de: "Was würde ein weiser Mentor zu deinem Dilemma sagen?", es: "¿Qué sugeriría un mentor sabio sobre tu dilema?", fr: "Que suggérerait un mentor sage à propos de votre dilemme ?", it: "Cosa suggerirebbe un saggio mentore sul tuo dilemma?", ja: "賢明なメンターはあなたのジレンマについて何を提案するでしょうか？", ko: "현명한 멘토는 당신의 딜레마에 대해 무엇을 제안할까요?", pl: "Co mądry mentor zasugerowałby w sprawie twojego dylematu?", pt: "O que um mentor sábio sugeriria sobre seu dilema?", ro: "Ce ar sugera un mentor înțelept despre dilema ta?", ru: "Что посоветовал бы мудрый наставник насчёт твоей дилеммы?", "zh-Hans": "一位睿智的导师会对你的困境提出什么建议？" },
  q023: { ar: "كيف يعكس هذا القرار أولوياتك؟", de: "Wie spiegelt diese Entscheidung deine Prioritäten wider?", es: "¿Cómo refleja esta decisión tus prioridades?", fr: "Comment cette décision reflète-t-elle vos priorités ?", it: "Come riflette questa decisione le tue priorità?", ja: "この決断はあなたの優先事項をどのように反映していますか？", ko: "이 결정은 당신의 우선순위를 어떻게 반영합니까?", pl: "Jak ta decyzja odzwierciedla twoje priorytety?", pt: "Como essa decisão reflete suas prioridades?", ro: "Cum reflectă această decizie prioritățile tale?", ru: "Как это решение отражает твои приоритеты?", "zh-Hans": "这个决定如何反映你的优先事项？" },
  // ── Relationships ─────────────────────────────────────────────────────────────
  q024: { ar: "من جعلك تشعر أنك مرئي حقاً اليوم؟", de: "Wer hat dich heute wirklich gesehen?", es: "¿Quién te hizo sentir verdaderamente visto hoy?", fr: "Qui vous a fait sentir vraiment vu(e) aujourd'hui ?", it: "Chi ti ha fatto sentire davvero visto oggi?", ja: "今日、あなたを本当に見てもらえたと感じさせてくれたのは誰ですか？", ko: "오늘 당신이 진정으로 인식받는다고 느끼게 해준 사람은 누구였습니까?", pl: "Kto sprawił dziś, że poczułeś się naprawdę dostrzeżony?", pt: "Quem fez você se sentir verdadeiramente visto hoje?", ro: "Cine te-a făcut să te simți cu adevărat văzut azi?", ru: "Кто сегодня заставил тебя почувствовать, что тебя по-настоящему видят?", "zh-Hans": "今天谁让你感到真正被看见？" },
  q025: { ar: "ما العلاقة التي تريد تعميقها؟", de: "Welche Beziehung möchtest du vertiefen?", es: "¿Qué relación te gustaría profundizar?", fr: "Quelle relation aimeriez-vous approfondir ?", it: "Quale relazione vorresti approfondire?", ja: "どの関係を深めたいですか？", ko: "어떤 관계를 깊게 하고 싶습니까?", pl: "Jaką relację chciałbyś pogłębić?", pt: "Qual relacionamento você gostaria de aprofundar?", ro: "Ce relație ai dori să aprofundezi?", ru: "Какие отношения ты хотел бы углубить?", "zh-Hans": "你想加深哪段关系？" },
  q026: { ar: "كيف كنت حاضراً لأحد اليوم؟", de: "Wie bist du heute für jemanden da gewesen?", es: "¿Cómo estuviste ahí para alguien hoy?", fr: "Comment avez-vous été présent(e) pour quelqu'un aujourd'hui ?", it: "Come sei stato presente per qualcuno oggi?", ja: "今日、誰かのために存在したのはどのようにしてですか？", ko: "오늘 누군가를 위해 어떻게 나타났습니까?", pl: "Jak dziś byłeś dla kogoś?", pt: "Como você esteve presente para alguém hoje?", ro: "Cum ai fost prezent pentru cineva azi?", ru: "Как ты сегодня поддержал кого-то?", "zh-Hans": "今天你是如何为某人出现的？" },
  q027: { ar: "ما الشعور الذي لم تعبر عنه وتريد مشاركته مع شخص ما؟", de: "Welches unausgesprochene Gefühl möchtest du mit jemandem teilen?", es: "¿Qué sentimiento no expresado te gustaría compartir con alguien?", fr: "Quel sentiment non exprimé aimeriez-vous partager avec quelqu'un ?", it: "Quale sentimento non espresso vorresti condividere con qualcuno?", ja: "誰かに伝えたい言葉にならない感情は何ですか？", ko: "누군가와 나누고 싶은 말로 표현되지 않은 감정은 무엇입니까?", pl: "Jakie niewypowiedziane uczucie chciałbyś podzielić się z kimś?", pt: "Qual sentimento não expresso você gostaria de compartilhar com alguém?", ro: "Ce sentiment neexprimat ai dori să împărtășești cu cineva?", ru: "Какое невысказанное чувство ты хотел бы поделиться с кем-то?", "zh-Hans": "你想和某人分享什么未说出口的感受？" },
  q028: { ar: "متى شعرت بالانفصال اليوم، وعمن؟", de: "Wann hast du dich heute abgetrennt gefühlt, und von wem?", es: "¿Cuándo te sentiste desconectado hoy, y de quién?", fr: "Quand vous êtes-vous senti(e) déconnecté(e) aujourd'hui, et de qui ?", it: "Quando ti sei sentito distante oggi, e da chi?", ja: "今日、誰からどのように切り離されたと感じましたか？", ko: "오늘 언제, 누구로부터 단절감을 느꼈습니까?", pl: "Kiedy dzisiaj poczułeś się odłączony i od kogo?", pt: "Quando você se sentiu desconectado hoje, e de quem?", ro: "Când te-ai simțit deconectat azi și față de cine?", ru: "Когда сегодня ты чувствовал отстранённость, и от кого?", "zh-Hans": "今天你什么时候感到疏离，与谁疏离？" },
  q029: { ar: "ماذا يعني الانتماء لك؟", de: "Was bedeutet Zugehörigkeit für dich?", es: "¿Qué significa la pertenencia para ti?", fr: "Que signifie l'appartenance pour vous ?", it: "Cosa significa l'appartenenza per te?", ja: "帰属とはあなたにとって何を意味しますか？", ko: "소속감은 당신에게 무엇을 의미합니까?", pl: "Co dla ciebie oznacza przynależność?", pt: "O que pertencer significa para você?", ro: "Ce înseamnă apartenența pentru tine?", ru: "Что для тебя означает принадлежность?", "zh-Hans": "归属感对你意味着什么？" },
  q030: { ar: "من يستخرج أفضل نسخة منك؟", de: "Wer bringt das Beste in dir zum Vorschein?", es: "¿Quién saca la mejor versión de ti?", fr: "Qui fait ressortir le meilleur de vous ?", it: "Chi tira fuori la versione migliore di te?", ja: "誰があなたの最善の姿を引き出してくれますか？", ko: "누가 당신의 최고 버전을 끌어냅니까?", pl: "Kto wydobywa z ciebie najlepszą wersję?", pt: "Quem traz à tona a melhor versão de você?", ro: "Cine scoate la iveală cea mai bună versiune a ta?", ru: "Кто вызывает лучшую версию тебя?", "zh-Hans": "谁能激发出你最好的一面？" },
  q031: { ar: "كيف يمكنك أن تكون صديقاً أو شريكاً أفضل؟", de: "Wie kannst du ein besserer Freund oder Partner sein?", es: "¿Cómo puedes ser un mejor amigo o pareja?", fr: "Comment pouvez-vous être un meilleur ami ou partenaire ?", it: "Come puoi essere un amico o un partner migliore?", ja: "どうすればより良い友人やパートナーになれますか？", ko: "더 나은 친구 또는 파트너가 되려면 어떻게 해야 합니까?", pl: "Jak możesz być lepszym przyjacielem lub partnerem?", pt: "Como você pode ser um amigo ou parceiro melhor?", ro: "Cum poți fi un prieten sau partener mai bun?", ru: "Как ты можешь стать лучшим другом или партнёром?", "zh-Hans": "你如何能成为更好的朋友或伴侣？" },
  q032: { ar: "ما الصراع الذي يحتاج إلى انتباهك؟", de: "Welcher Konflikt braucht deine Aufmerksamkeit?", es: "¿Qué conflicto necesita tu atención?", fr: "Quel conflit nécessite votre attention ?", it: "Quale conflitto ha bisogno della tua attenzione?", ja: "どの対立に注意が必要ですか？", ko: "어떤 갈등이 당신의 관심을 필요로 합니까?", pl: "Jaki konflikt wymaga twojej uwagi?", pt: "Qual conflito precisa da sua atenção?", ro: "Ce conflict are nevoie de atenția ta?", ru: "Какой конфликт требует твоего внимания?", "zh-Hans": "哪个冲突需要你的关注？" },
  q033: { ar: "متى شعرت بأكبر قدر من التواصل اليوم؟", de: "Wann hast du dich heute am verbundensten gefühlt?", es: "¿Cuándo te sentiste más conectado hoy?", fr: "Quand vous êtes-vous senti(e) le plus connecté(e) aujourd'hui ?", it: "Quando ti sei sentito più connesso oggi?", ja: "今日、最もつながっていると感じたのはいつですか？", ko: "오늘 가장 연결되어 있다고 느낀 때는 언제였습니까?", pl: "Kiedy dziś czułeś się najbardziej połączony?", pt: "Quando você se sentiu mais conectado hoje?", ro: "Când te-ai simțit cel mai conectat azi?", ru: "Когда сегодня ты чувствовал себя наиболее связанным с другими?", "zh-Hans": "今天你什么时候感到最有连结感？" },
  q034: { ar: "ما الحدود التي تحتاج إلى وضعها؟", de: "Welche Grenzen musst du setzen?", es: "¿Qué límites necesitas establecer?", fr: "Quelles limites devez-vous fixer ?", it: "Quali confini hai bisogno di stabilire?", ja: "どのような境界線を設ける必要がありますか？", ko: "어떤 경계를 설정해야 합니까?", pl: "Jakie granice musisz wyznaczyć?", pt: "Quais limites você precisa estabelecer?", ro: "Ce limite trebuie să stabilești?", ru: "Какие границы тебе нужно установить?", "zh-Hans": "你需要设定什么界限？" },
  // ── Fear ──────────────────────────────────────────────────────────────────────
  q035: { ar: "ما الخوف الذي أعاقك اليوم؟", de: "Welche Angst hat dich heute zurückgehalten?", es: "¿Qué miedo te retuvo hoy?", fr: "Quelle peur vous a retenu(e) aujourd'hui ?", it: "Quale paura ti ha trattenuto oggi?", ja: "今日、どんな恐怖があなたを引き止めましたか？", ko: "오늘 어떤 두려움이 당신을 막았습니까?", pl: "Jaki strach powstrzymał cię dziś?", pt: "Qual medo te reteve hoje?", ro: "Ce frică te-a oprit azi?", ru: "Какой страх сдерживал тебя сегодня?", "zh-Hans": "今天什么恐惧阻碍了你？" },
  q036: { ar: "ما الذي ستحاول فعله لو علمت أنك لن تفشل؟", de: "Was würdest du versuchen, wenn du wüsstest, dass du nicht scheitern kannst?", es: "¿Qué intentarías si supieras que no puedes fallar?", fr: "Que tenteriez-vous si vous saviez que vous ne pouvez pas échouer ?", it: "Cosa tenteresti se sapessi che non puoi fallire?", ja: "失敗しないとわかっていたら、何に挑戦しますか？", ko: "실패할 수 없다는 것을 안다면 무엇을 시도하겠습니까?", pl: "Co byś spróbował, gdybyś wiedział, że nie możesz ponieść porażki?", pt: "O que você tentaria se soubesse que não pode falhar?", ro: "Ce ai încerca dacă ai ști că nu poți eșua?", ru: "Что бы ты попробовал, если бы знал, что не можешь потерпеть неудачу?", "zh-Hans": "如果你知道不会失败，你会尝试什么？" },
  q037: { ar: "ما المخاطرة التي تفكر فيها؟", de: "Welches Risiko erwägst du?", es: "¿Qué riesgo estás considerando?", fr: "Quel risque envisagez-vous ?", it: "Quale rischio stai considerando?", ja: "どのようなリスクを検討していますか？", ko: "어떤 위험을 고려하고 있습니까?", pl: "Jakie ryzyko rozważasz?", pt: "Qual risco você está considerando?", ro: "Ce risc iei în considerare?", ru: "Какой риск ты рассматриваешь?", "zh-Hans": "你在考虑什么风险？" },
  q038: { ar: "متى شعرت بالشجاعة اليوم؟", de: "Wann hast du dich heute mutig gefühlt?", es: "¿Cuándo te sentiste valiente hoy?", fr: "Quand vous êtes-vous senti(e) courageux(se) aujourd'hui ?", it: "Quando ti sei sentito coraggioso oggi?", ja: "今日、勇気を感じたのはいつですか？", ko: "오늘 언제 용감함을 느꼈습니까?", pl: "Kiedy dziś poczułeś się odważny?", pt: "Quando você se sentiu corajoso hoje?", ro: "Când te-ai simțit curajos azi?", ru: "Когда сегодня ты почувствовал себя смелым?", "zh-Hans": "今天你什么时候感到勇敢？" },
  q039: { ar: "ما المعتقد عن نفسك الذي يعيقك؟", de: "Welche Überzeugung über dich selbst hält dich zurück?", es: "¿Qué creencia sobre ti mismo te está frenando?", fr: "Quelle croyance sur vous-même vous retient ?", it: "Quale credenza su di te ti sta trattenendo?", ja: "自分についてのどんな信念があなたを妨げていますか？", ko: "자신에 대한 어떤 믿음이 당신을 방해하고 있습니까?", pl: "Jakie przekonanie o sobie cię powstrzymuje?", pt: "Qual crença sobre si mesmo está te impedindo?", ro: "Ce credință despre tine te ține pe loc?", ru: "Какое убеждение о себе сдерживает тебя?", "zh-Hans": "你对自己的什么信念在阻碍你？" },
  q040: { ar: "ما الذي ستفعله بشكل مختلف إذا كنت بلا خوف؟", de: "Was würdest du anders machen, wenn du furchtlos wärst?", es: "¿Qué harías diferente si fueras valiente?", fr: "Que feriez-vous différemment si vous étiez sans peur ?", it: "Cosa faresti diversamente se fossi senza paura?", ja: "恐れがなければ何を違うようにしますか？", ko: "두려움이 없다면 무엇을 다르게 하겠습니까?", pl: "Co byś zrobił inaczej, gdybyś był nieustraszony?", pt: "O que você faria diferente se fosse destemido?", ro: "Ce ai face diferit dacă nu ți-ar fi frică de nimic?", ru: "Что бы ты сделал иначе, если бы был бесстрашным?", "zh-Hans": "如果你无所畏惧，你会有什么不同的做法？" },
  q041: { ar: "ما الخطوة الصغيرة التي يمكنك اتخاذها نحو خوفك؟", de: "Welchen kleinen Schritt könntest du in Richtung deiner Angst machen?", es: "¿Qué pequeño paso podrías dar hacia tu miedo?", fr: "Quelle petite étape pourriez-vous faire vers votre peur ?", it: "Quale piccolo passo potresti fare verso la tua paura?", ja: "あなたの恐怖に向かってどんな小さな一歩を踏み出せますか？", ko: "두려움을 향해 어떤 작은 발걸음을 내딛을 수 있습니까?", pl: "Jaki mały krok możesz zrobić w stronę swojego strachu?", pt: "Que pequeno passo você poderia dar em direção ao seu medo?", ro: "Ce mic pas ai putea face spre frica ta?", ru: "Какой маленький шаг ты мог бы сделать навстречу своему страху?", "zh-Hans": "你可以朝着恐惧迈出什么小步？" },
  q042: { ar: "متى تغلبت على خوف مماثل من قبل؟", de: "Wann hast du früher eine ähnliche Angst überwunden?", es: "¿Cuándo has superado un miedo similar antes?", fr: "Quand avez-vous surmonté une peur similaire auparavant ?", it: "Quando hai superato una paura simile in precedenza?", ja: "以前、似たような恐怖を克服したのはいつですか？", ko: "이전에 비슷한 두려움을 언제 극복했습니까?", pl: "Kiedy wcześniej pokonałeś podobny strach?", pt: "Quando você superou um medo semelhante antes?", ro: "Când ai depășit o frică similară înainte?", ru: "Когда ты прежде преодолевал подобный страх?", "zh-Hans": "你以前什么时候克服过类似的恐惧？" },
  q043: { ar: "ما الذي تخشى خسارته أكثر؟", de: "Was fürchtest du am meisten zu verlieren?", es: "¿Qué es lo que más temes perder?", fr: "Que craignez-vous le plus de perdre ?", it: "Di cosa hai più paura di perdere?", ja: "最も失うことを恐れているものは何ですか？", ko: "잃는 것이 가장 두려운 것은 무엇입니까?", pl: "Czego najbardziej boisz się stracić?", pt: "O que você mais tem medo de perder?", ro: "De ce ți-e cel mai teamă să pierzi?", ru: "Что ты боишься потерять больше всего?", "zh-Hans": "你最害怕失去什么？" },
  q044: { ar: "ما الذي يخيفك في النمو؟", de: "Was macht dir Angst am Wachsen?", es: "¿Qué te asusta del crecimiento?", fr: "Qu'est-ce qui vous fait peur dans le fait de grandir ?", it: "Cosa ti spaventa della crescita?", ja: "成長することのどこが怖いですか？", ko: "성장에 대해 무엇이 두렵습니까?", pl: "Co przeraża cię w kwestii wzrostu?", pt: "O que te assusta sobre crescer?", ro: "Ce te sperie în legătură cu creșterea?", ru: "Что тебя пугает в росте?", "zh-Hans": "成长让你害怕什么？" },
  q045: { ar: "كيف يمكن أن يكون هذا الخوف يخدمك فعلاً؟", de: "Wie könnte dir diese Angst tatsächlich nützen?", es: "¿Cómo podría este miedo en realidad servirte?", fr: "Comment cette peur pourrait-elle vous être utile ?", it: "Come potrebbe questa paura servirti davvero?", ja: "この恐怖は実際にどのようにあなたの役に立っているでしょうか？", ko: "이 두려움이 실제로 당신에게 어떻게 도움이 될 수 있습니까?", pl: "Jak ten strach może ci w rzeczywistości służyć?", pt: "Como esse medo pode na verdade estar te servindo?", ro: "Cum te-ar putea servi cu adevărat această frică?", ru: "Как этот страх может на самом деле служить тебе?", "zh-Hans": "这种恐惧实际上如何在帮助你？" },
  // ── Gratitude ─────────────────────────────────────────────────────────────────
  q046: { ar: "عمَّ أنت ممتن اليوم؟", de: "Wofür bist du heute dankbar?", es: "¿Por qué estás agradecido hoy?", fr: "Pour quoi êtes-vous reconnaissant(e) aujourd'hui ?", it: "Di cosa sei grato oggi?", ja: "今日、何に感謝していますか？", ko: "오늘 무엇에 감사합니까?", pl: "Za co jesteś dziś wdzięczny?", pt: "Pelo que você é grato hoje?", ro: "Pentru ce ești recunoscător azi?", ru: "За что ты сегодня благодарен?", "zh-Hans": "今天你感激什么？" },
  q047: { ar: "لمن أنت ممتن، ولماذا؟", de: "Wem bist du dankbar, und warum?", es: "¿Por quién estás agradecido, y por qué?", fr: "Pour qui êtes-vous reconnaissant(e), et pourquoi ?", it: "Per chi sei grato, e perché?", ja: "誰に感謝しており、それはなぜですか？", ko: "누구에게 감사하며, 그 이유는 무엇입니까?", pl: "Za kogo jesteś wdzięczny i dlaczego?", pt: "Por quem você é grato, e por quê?", ro: "Față de cine ești recunoscător și de ce?", ru: "Кому ты благодарен, и почему?", "zh-Hans": "你感激谁，为什么？" },
  q048: { ar: "ما اللحظة الصغيرة التي جلبت لك الفرح؟", de: "Welcher kleine Moment hat dir Freude gebracht?", es: "¿Qué pequeño momento te trajo alegría?", fr: "Quel petit moment vous a apporté de la joie ?", it: "Quale piccolo momento ti ha portato gioia?", ja: "どんな小さな瞬間があなたに喜びをもたらしましたか？", ko: "어떤 작은 순간이 당신에게 기쁨을 가져다 주었습니까?", pl: "Jaki mały moment przyniósł ci radość?", pt: "Qual pequeno momento lhe trouxe alegria?", ro: "Ce mic moment ți-a adus bucurie?", ru: "Какой маленький момент принёс тебе радость?", "zh-Hans": "哪个小小的时刻给你带来了快乐？" },
  q049: { ar: "ما الامتياز الذي كثيراً ما تتجاهله؟", de: "Welches Privileg übersiehst du oft?", es: "¿Qué privilegio a menudo pasas por alto?", fr: "Quel privilège négligez-vous souvent ?", it: "Quale privilegio spesso ignori?", ja: "よく見落としている特権は何ですか？", ko: "자주 간과하는 특권은 무엇입니까?", pl: "Jakie przywileje często pomijasz?", pt: "Qual privilégio você frequentemente ignora?", ro: "Ce privilegiu treci deseori cu vederea?", ru: "Какую привилегию ты часто не замечаешь?", "zh-Hans": "你经常忽视什么特权？" },
  q050: { ar: "ما الذي تقدّره في نفسك؟", de: "Was schätzt du an dir selbst?", es: "¿Qué aprecias de ti mismo?", fr: "Qu'appréciez-vous en vous-même ?", it: "Cosa apprezzi di te stesso?", ja: "自分自身についてどんなことを高く評価していますか？", ko: "자신에 대해 무엇을 감사하게 여깁니까?", pl: "Co doceniasz w sobie?", pt: "O que você aprecia em si mesmo?", ro: "Ce apreciezi la tine însuți?", ru: "Что ты ценишь в себе?", "zh-Hans": "你对自己有什么欣赏？" },
  q051: { ar: "كيف أبدى شخص ما اهتماماً بك؟", de: "Wie hat jemand Fürsorge für dich gezeigt?", es: "¿Cómo te mostró alguien cariño?", fr: "Comment quelqu'un vous a-t-il témoigné de l'attention ?", it: "Come qualcuno ti ha mostrato cura?", ja: "誰かがあなたへの思いやりをどのように示してくれましたか？", ko: "누군가 어떻게 당신에 대한 배려를 보여주었습니까?", pl: "Jak ktoś okazał ci troskę?", pt: "Como alguém mostrou cuidado por você?", ro: "Cum ți-a arătat cineva că îi pasă de tine?", ru: "Как кто-то проявил к тебе заботу?", "zh-Hans": "有人是如何向你表达关心的？" },
  q052: { ar: "ما الذي أعتبره أمراً مسلماً به؟", de: "Was nehme ich als selbstverständlich hin?", es: "¿Qué estoy dando por sentado?", fr: "Qu'est-ce que je tiens pour acquis ?", it: "Cosa sto dando per scontato?", ja: "当然のことと思っているものは何ですか？", ko: "당연하게 여기고 있는 것은 무엇입니까?", pl: "Co uznaję za oczywiste?", pt: "O que estou tomando como garantido?", ro: "Ce iau de-a gata?", ru: "Что я принимаю как должное?", "zh-Hans": "我在理所当然地对待什么？" },
  q053: { ar: "ما التحدي الذي علّمك شيئاً قيّماً؟", de: "Welche Herausforderung hat dich etwas Wertvolles gelehrt?", es: "¿Qué desafío te enseñó algo valioso?", fr: "Quel défi vous a appris quelque chose de précieux ?", it: "Quale sfida ti ha insegnato qualcosa di prezioso?", ja: "どんな挑戦があなたに貴重なことを教えてくれましたか？", ko: "어떤 도전이 당신에게 귀중한 것을 가르쳐 주었습니까?", pl: "Jakie wyzwanie nauczyło cię czegoś cennego?", pt: "Qual desafio te ensinou algo valioso?", ro: "Ce provocare te-a învățat ceva valoros?", ru: "Какое испытание научило тебя чему-то ценному?", "zh-Hans": "哪个挑战教会了你有价值的东西？" },
  q054: { ar: "في ماذا أنت في أوفر حال؟", de: "Woran hast du am meisten im Überfluss?", es: "¿En qué eres más abundante?", fr: "De quoi êtes-vous le plus abondant(e) ?", it: "Di cosa sei più abbondante?", ja: "最も豊富に持っているものは何ですか？", ko: "무엇이 가장 풍부합니까?", pl: "W czym masz największy dostatek?", pt: "Do que você tem em mais abundância?", ro: "La ce ești cel mai bogat?", ru: "Чего у тебя больше всего в изобилии?", "zh-Hans": "你最丰盛的是什么？" },
  q055: { ar: "كيف غيّرك شخص صعب المراس نحو الأفضل؟", de: "Wie hat dich eine schwierige Person zum Besseren verändert?", es: "¿Cómo te ha cambiado para mejor una persona difícil?", fr: "Comment une personne difficile vous a-t-elle changé en mieux ?", it: "Come ti ha cambiato in meglio una persona difficile?", ja: "難しい人があなたをどのように良い方向に変えてくれましたか？", ko: "어려운 사람이 어떻게 당신을 더 나은 방향으로 변화시켰습니까?", pl: "Jak trudna osoba zmieniła cię na lepsze?", pt: "Como uma pessoa difícil te mudou para melhor?", ro: "Cum te-a schimbat în bine o persoană dificilă?", ru: "Как сложный человек изменил тебя к лучшему?", "zh-Hans": "一个难相处的人如何让你变得更好？" },
  q056: { ar: "ما الهدية غير المتوقعة التي أحضرها اليوم؟", de: "Welches unerwartete Geschenk hat dir heute gebracht?", es: "¿Qué regalo inesperado trajo hoy?", fr: "Quel cadeau inattendu aujourd'hui vous a-t-il apporté ?", it: "Quale dono inaspettato ha portato oggi?", ja: "今日はどんな予想外の贈り物をもたらしましたか？", ko: "오늘은 어떤 예상치 못한 선물을 가져왔습니까?", pl: "Jaki niespodziewany prezent przyniósł ci dziś?", pt: "Que presente inesperado o dia de hoje trouxe?", ro: "Ce dar neașteptat a adus ziua de azi?", ru: "Какой неожиданный подарок принёс тебе сегодняшний день?", "zh-Hans": "今天带来了什么意想不到的礼物？" },
  q057: { ar: "على ماذا أنت ممتن حقاً أنك لم تحصل عليه؟", de: "Wofür bist du wirklich dankbar, dass du es nicht bekommen hast?", es: "¿Por qué estás genuinamente agradecido de no haber obtenido?", fr: "Pour quoi êtes-vous sincèrement reconnaissant(e) de ne pas avoir obtenu ?", it: "Di cosa sei genuinamente grato di non aver ottenuto?", ja: "得られなかったことに本当に感謝していることは何ですか？", ko: "얻지 못한 것에 대해 진심으로 감사하는 것은 무엇입니까?", pl: "Za co jesteś naprawdę wdzięczny, że tego nie dostałeś?", pt: "Pelo que você é genuinamente grato por não ter recebido?", ro: "Pentru ce ești sincer recunoscător că nu ai primit?", ru: "За что ты искренне благодарен, что не получил?", "zh-Hans": "你真心感谢自己没有得到什么？" },
  // ── Future ────────────────────────────────────────────────────────────────────
  q058: { ar: "نحو ماذا تبني؟", de: "Worauf baust du hin?", es: "¿Hacia qué estás construyendo?", fr: "Vers quoi construisez-vous ?", it: "Verso cosa stai costruendo?", ja: "何に向けて構築していますか？", ko: "무엇을 향해 나아가고 있습니까?", pl: "Ku czemu budujesz?", pt: "Em direção a que você está construindo?", ro: "Spre ce construiești?", ru: "К чему ты стремишься?", "zh-Hans": "你在朝着什么目标努力？" },
  q059: { ar: "كيف سيبدو يومك المثالي بعد خمس سنوات؟", de: "Wie würde dein idealer Tag in fünf Jahren aussehen?", es: "¿Cómo sería tu día ideal en cinco años?", fr: "À quoi ressemblerait votre journée idéale dans cinq ans ?", it: "Come sarebbe la tua giornata ideale fra cinque anni?", ja: "5年後の理想の一日はどのようなものでしょうか？", ko: "5년 후의 이상적인 하루는 어떤 모습일까요?", pl: "Jak wyglądałby twój idealny dzień za pięć lat?", pt: "Como seria seu dia ideal em cinco anos?", ro: "Cum ar arăta ziua ta ideală peste cinci ani?", ru: "Как бы выглядел твой идеальный день через пять лет?", "zh-Hans": "五年后你的理想一天会是什么样子？" },
  q060: { ar: "ما الإرث الذي تريد تركه؟", de: "Welches Erbe möchtest du hinterlassen?", es: "¿Qué legado quieres dejar?", fr: "Quel héritage voulez-vous laisser ?", it: "Quale eredità vuoi lasciare?", ja: "どのような遺産を残したいですか？", ko: "어떤 유산을 남기고 싶습니까?", pl: "Jakie dziedzictwo chcesz zostawić?", pt: "Que legado você quer deixar?", ro: "Ce moștenire vrei să lași?", ru: "Какое наследие ты хочешь оставить?", "zh-Hans": "你想留下什么遗产？" },
  q061: { ar: "ما المهارة التي تريد تطويرها؟", de: "Welche Fähigkeit möchtest du entwickeln?", es: "¿Qué habilidad te gustaría desarrollar?", fr: "Quelle compétence aimeriez-vous développer ?", it: "Quale abilità vorresti sviluppare?", ja: "どんなスキルを磨きたいですか？", ko: "어떤 기술을 개발하고 싶습니까?", pl: "Jaką umiejętność chciałbyś rozwinąć?", pt: "Que habilidade você gostaria de desenvolver?", ro: "Ce abilitate ți-ar plăcea să dezvolți?", ru: "Какой навык ты хочешь развить?", "zh-Hans": "你想发展什么技能？" },
  q062: { ar: "ما الاحتمال الذي يثيرك أكثر؟", de: "Welche Möglichkeit begeistert dich am meisten?", es: "¿Qué posibilidad te emociona más?", fr: "Quelle possibilité vous enthousiasme le plus ?", it: "Quale possibilità ti entusiasma di più?", ja: "最もワクワクする可能性は何ですか？", ko: "어떤 가능성이 가장 흥미롭습니까?", pl: "Jaka możliwość najbardziej cię ekscytuje?", pt: "Qual possibilidade te anima mais?", ro: "Ce posibilitate te entuziasmează cel mai mult?", ru: "Какая возможность захватывает тебя больше всего?", "zh-Hans": "什么可能性最让你兴奋？" },
  q063: { ar: "كيف تريد أن تنمو؟", de: "Wie möchtest du wachsen?", es: "¿Cómo quieres crecer?", fr: "Comment voulez-vous évoluer ?", it: "Come vuoi crescere?", ja: "どのように成長したいですか？", ko: "어떻게 성장하고 싶습니까?", pl: "Jak chcesz się rozwijać?", pt: "Como você quer crescer?", ro: "Cum vrei să crești?", ru: "Как ты хочешь расти?", "zh-Hans": "你想如何成长？" },
  q064: { ar: "ما الحلم الذي كنت تؤجله؟", de: "Welchen Traum hast du aufgeschoben?", es: "¿Qué sueño has estado postergando?", fr: "Quel rêve avez-vous repoussé ?", it: "Quale sogno hai rimandato?", ja: "先延ばしにしてきた夢は何ですか？", ko: "어떤 꿈을 미루어 왔습니까?", pl: "Jakie marzenie odkładałeś?", pt: "Qual sonho você tem adiado?", ro: "Ce vis ai amânat?", ru: "Какую мечту ты откладывал?", "zh-Hans": "你一直推迟的梦想是什么？" },
  q065: { ar: "ما الإنجاز الذي يهمك أكثر؟", de: "Welcher Meilenstein ist dir am wichtigsten?", es: "¿Qué hito es más importante para ti?", fr: "Quel jalon compte le plus pour vous ?", it: "Quale traguardo conta di più per te?", ja: "どのマイルストーンが最も重要ですか？", ko: "어떤 이정표가 당신에게 가장 중요합니까?", pl: "Jaki kamień milowy ma dla ciebie największe znaczenie?", pt: "Qual marco importa mais para você?", ro: "Ce etapă importantă contează cel mai mult pentru tine?", ru: "Какая веха наиболее важна для тебя?", "zh-Hans": "哪个里程碑对你最重要？" },
  q066: { ar: "من تريد أن تصبح؟", de: "Wer möchtest du werden?", es: "¿En quién quieres convertirte?", fr: "Qui voulez-vous devenir ?", it: "Chi vuoi diventare?", ja: "あなたはどんな人になりたいですか？", ko: "어떤 사람이 되고 싶습니까?", pl: "Kim chcesz się stać?", pt: "Quem você quer se tornar?", ro: "Cine vrei să devii?", ru: "Кем ты хочешь стать?", "zh-Hans": "你想成为什么样的人？" },
  q067: { ar: "على ماذا سيشكرك نفسك المستقبلي اليوم؟", de: "Wofür würde dein zukünftiges Ich dir heute danken?", es: "¿Por qué te agradecería tu yo futuro hoy?", fr: "Pour quoi votre futur moi vous remercierait-il aujourd'hui ?", it: "Per cosa ti ringrazierebbe il tuo sé futuro oggi?", ja: "未来の自分は今日のあなたに何を感謝するでしょうか？", ko: "미래의 자신은 오늘의 당신에게 무엇에 감사할까요?", pl: "Za co twoje przyszłe ja podziękowałoby ci dziś?", pt: "Pelo que seu eu futuro te agradeceria hoje?", ro: "Pentru ce te-ar mulțumi viitorul tău eu azi?", ru: "За что твоё будущее «я» поблагодарило бы тебя сегодня?", "zh-Hans": "未来的你会为今天的什么感谢你？" },
  q068: { ar: "لماذا تزرع البذور؟", de: "Wofür pflanzt du Samen?", es: "¿Para qué estás plantando semillas?", fr: "Pour quoi plantez-vous des graines ?", it: "Per cosa stai piantando semi?", ja: "何の種を蒔いていますか？", ko: "무엇을 위해 씨앗을 심고 있습니까?", pl: "Dla czego siasz ziarno?", pt: "Para que você está plantando sementes?", ro: "Pentru ce plantezi semințe?", ru: "Что ты засеваешь?", "zh-Hans": "你在为什么播种？" },
  q069: { ar: "ماذا يعني النجاح لك بعد خمس سنوات؟", de: "Was bedeutet Erfolg für dich in fünf Jahren?", es: "¿Qué significa el éxito para ti dentro de cinco años?", fr: "Que signifie le succès pour vous dans cinq ans ?", it: "Cosa significa il successo per te fra cinque anni?", ja: "5年後、成功はあなたにとって何を意味しますか？", ko: "5년 후의 성공은 당신에게 무엇을 의미합니까?", pl: "Co dla ciebie oznacza sukces za pięć lat?", pt: "O que sucesso significa para você daqui a cinco anos?", ro: "Ce înseamnă succesul pentru tine peste cinci ani?", ru: "Что для тебя означает успех через пять лет?", "zh-Hans": "五年后，成功对你意味着什么？" },
  // ── Creativity ────────────────────────────────────────────────────────────────
  q070: { ar: "كيف عبّرت عن نفسك اليوم؟", de: "Wie hast du dich heute ausgedrückt?", es: "¿Cómo te expresaste hoy?", fr: "Comment vous êtes-vous exprimé(e) aujourd'hui ?", it: "Come ti sei espresso oggi?", ja: "今日、自分をどのように表現しましたか？", ko: "오늘 어떻게 자신을 표현했습니까?", pl: "Jak wyraziłeś siebie dziś?", pt: "Como você se expressou hoje?", ro: "Cum te-ai exprimat azi?", ru: "Как ты выразил себя сегодня?", "zh-Hans": "今天你是如何表达自己的？" },
  q071: { ar: "ما الذي يُبرز جانبك الإبداعي؟", de: "Was bringt deine kreative Seite zum Vorschein?", es: "¿Qué saca tu lado creativo?", fr: "Qu'est-ce qui fait ressortir votre côté créatif ?", it: "Cosa fa emergere il tuo lato creativo?", ja: "あなたの創造的な側面を引き出すものは何ですか？", ko: "당신의 창의적인 면을 끌어내는 것은 무엇입니까?", pl: "Co wydobywa twój kreatywny potencjał?", pt: "O que traz à tona seu lado criativo?", ro: "Ce îți scoate la iveală latura creativă?", ru: "Что пробуждает твою творческую сторону?", "zh-Hans": "什么激发出你的创意一面？" },
  q072: { ar: "ماذا ستبتكر لو لم يوجد حكم على الآخرين؟", de: "Was würdest du erschaffen, wenn es kein Urteil gäbe?", es: "¿Qué crearías si no existiera el juicio?", fr: "Que créeriez-vous si le jugement n'existait pas ?", it: "Cosa creeresti se il giudizio non esistesse?", ja: "批判がなければ何を作りますか？", ko: "판단이 존재하지 않는다면 무엇을 만들겠습니까?", pl: "Co byś stworzył, gdyby nie istniały osądy?", pt: "O que você criaria se o julgamento não existisse?", ro: "Ce ai crea dacă judecata nu ar exista?", ru: "Что бы ты создал, если бы не было осуждения?", "zh-Hans": "如果没有评判，你会创造什么？" },
  q073: { ar: "متى شعرت بأكبر قدر من المرح؟", de: "Wann hast du dich am spielerischsten gefühlt?", es: "¿Cuándo te sentiste más juguetón?", fr: "Quand vous êtes-vous senti(e) le plus joueur(se) ?", it: "Quando ti sei sentito più giocoso?", ja: "最も遊び心を感じたのはいつですか？", ko: "언제 가장 장난기 넘친다고 느꼈습니까?", pl: "Kiedy byłeś najbardziej rozbawiony?", pt: "Quando você se sentiu mais brincalhão?", ro: "Când te-ai simțit cel mai jucăuș?", ru: "Когда ты чувствовал себя наиболее игривым?", "zh-Hans": "你什么时候感到最快乐好玩？" },
  q074: { ar: "ما الشغف الإبداعي الذي تخليت عنه؟", de: "Welche kreative Leidenschaft hast du aufgegeben?", es: "¿Qué pasión creativa has abandonado?", fr: "Quelle passion créative avez-vous abandonnée ?", it: "Quale passione creativa hai abbandonato?", ja: "どんな創造的な情熱を諦めてしまいましたか？", ko: "어떤 창의적인 열정을 포기했습니까?", pl: "Jaką twórczą pasję porzuciłeś?", pt: "Qual paixão criativa você abandonou?", ro: "Ce pasiune creativă ai abandonat?", ru: "Какую творческую страсть ты бросил?", "zh-Hans": "你放弃了什么创意热情？" },
  q075: { ar: "ما الذي يلهمك؟", de: "Was inspiriert dich?", es: "¿Qué te inspira?", fr: "Qu'est-ce qui vous inspire ?", it: "Cosa ti ispira?", ja: "何があなたに刺激を与えますか？", ko: "무엇이 당신에게 영감을 줍니까?", pl: "Co cię inspiruje?", pt: "O que te inspira?", ro: "Ce te inspiră?", ru: "Что тебя вдохновляет?", "zh-Hans": "什么启发了你？" },
  q076: { ar: "ما الذي ستحاوله لو لم تكن قلقاً من أن تبدو سخيفاً؟", de: "Was würdest du ausprobieren, wenn du dir keine Sorgen machen müsstest, albern auszusehen?", es: "¿Qué intentarías si no te preocupara parecer ridículo?", fr: "Que tenteriez-vous si vous n'aviez pas peur d'avoir l'air ridicule ?", it: "Cosa proveresti se non ti preoccupassi di sembrare sciocco?", ja: "バカに見えることを心配しなければ何を試しますか？", ko: "어리석어 보이는 것에 대해 걱정하지 않는다면 무엇을 시도하겠습니까?", pl: "Co byś spróbował, gdybyś nie martwił się o to, że wyglądasz głupio?", pt: "O que você tentaria se não se preocupasse em parecer bobo?", ro: "Ce ai încerca dacă nu te-ai teme să pari ridicol?", ru: "Что бы ты попробовал, если бы не боялся выглядеть глупо?", "zh-Hans": "如果你不担心看起来傻，你会尝试什么？" },
  q077: { ar: "كيف تعبّر حالياً عن وجهة نظرك الفريدة؟", de: "Wie drückst du derzeit deine einzigartige Perspektive aus?", es: "¿Cómo expresas actualmente tu perspectiva única?", fr: "Comment exprimez-vous actuellement votre perspective unique ?", it: "Come esprimi attualmente la tua prospettiva unica?", ja: "今、自分独自の視点をどのように表現していますか？", ko: "현재 당신만의 독특한 관점을 어떻게 표현하고 있습니까?", pl: "Jak obecnie wyrażasz swój unikalny punkt widzenia?", pt: "Como você expressa atualmente sua perspectiva única?", ro: "Cum îți exprimi în prezent perspectiva unică?", ru: "Как ты в настоящее время выражаешь свою уникальную точку зрения?", "zh-Hans": "你目前如何表达自己独特的视角？" },
  q078: { ar: "ما الخطوة التجريبية التي يمكنك اتخاذها؟", de: "Welchen experimentellen Schritt könntest du unternehmen?", es: "¿Qué paso experimental podrías dar?", fr: "Quelle étape expérimentale pourriez-vous franchir ?", it: "Quale passo sperimentale potresti fare?", ja: "どんな実験的な一歩を踏み出せますか？", ko: "어떤 실험적인 발걸음을 내딛을 수 있습니까?", pl: "Jaki eksperymentalny krok możesz podjąć?", pt: "Qual passo experimental você poderia dar?", ro: "Ce pas experimental ai putea face?", ru: "Какой экспериментальный шаг ты мог бы предпринять?", "zh-Hans": "你可以采取什么实验性的步骤？" },
  q079: { ar: "أي شكل من أشكال الفن يناديك؟", de: "Welche Kunstform lockt dich?", es: "¿Qué forma de arte te llama?", fr: "Quelle forme d'art vous appelle ?", it: "Quale forma d'arte ti chiama?", ja: "どんな芸術形式があなたを呼んでいますか？", ko: "어떤 예술 형식이 당신에게 끌립니까?", pl: "Jaka forma sztuki cię przyciąga?", pt: "Que forma de arte te chama?", ro: "Ce formă de artă te cheamă?", ru: "Какая форма искусства зовёт тебя?", "zh-Hans": "哪种艺术形式在呼唤你？" },
  q080: { ar: "كيف يمكنك إدخال المزيد من الإبداع في حياتك؟", de: "Wie kannst du mehr Kreativität in dein Leben bringen?", es: "¿Cómo puedes traer más creatividad a tu vida?", fr: "Comment pouvez-vous apporter plus de créativité dans votre vie ?", it: "Come puoi portare più creatività nella tua vita?", ja: "どうすれば生活にもっと創造性をもたらせますか？", ko: "삶에 더 많은 창의성을 가져오려면 어떻게 해야 합니까?", pl: "Jak możesz wnieść więcej kreatywności do swojego życia?", pt: "Como você pode trazer mais criatividade à sua vida?", ro: "Cum poți aduce mai multă creativitate în viața ta?", ru: "Как ты можешь привнести больше творчества в свою жизнь?", "zh-Hans": "你如何将更多的创意带入生活？" },
  // ── Freeform ──────────────────────────────────────────────────────────────────
  q081: { ar: "ماذا علّمك اليوم؟", de: "Was hat dich heute gelehrt?", es: "¿Qué te enseñó hoy?", fr: "Qu'est-ce que la journée vous a enseigné ?", it: "Cosa ti ha insegnato oggi?", ja: "今日、何を学びましたか？", ko: "오늘은 무엇을 가르쳐 주었습니까?", pl: "Czego nauczył cię dzisiejszy dzień?", pt: "O que hoje te ensinou?", ro: "Ce te-a învățat ziua de azi?", ru: "Чему тебя научил сегодняшний день?", "zh-Hans": "今天教会了你什么？" },
  q082: { ar: "ما الذي فاجأك اليوم؟", de: "Was hat dich heute überrascht?", es: "¿Qué te sorprendió hoy?", fr: "Qu'est-ce qui vous a surpris(e) aujourd'hui ?", it: "Cosa ti ha sorpreso oggi?", ja: "今日、何に驚きましたか？", ko: "오늘 무엇이 당신을 놀라게 했습니까?", pl: "Co cię dziś zaskoczyło?", pt: "O que te surpreendeu hoje?", ro: "Ce te-a surprins azi?", ru: "Что тебя удивило сегодня?", "zh-Hans": "今天有什么让你感到惊讶？" },
  q083: { ar: "ما الذي تريد أن تتذكره عن اليوم؟", de: "Was möchtest du über heute in Erinnerung behalten?", es: "¿Qué querrías recordar de hoy?", fr: "Que voudriez-vous retenir de cette journée ?", it: "Cosa vorresti ricordare di oggi?", ja: "今日について何を覚えていたいですか？", ko: "오늘에 대해 무엇을 기억하고 싶습니까?", pl: "Co chciałbyś zapamiętać z dzisiejszego dnia?", pt: "O que você gostaria de lembrar sobre hoje?", ro: "Ce ai vrea să îți amintești despre ziua de azi?", ru: "Что ты хотел бы запомнить о сегодняшнем дне?", "zh-Hans": "关于今天，你想记住什么？" },
  q084: { ar: "لو كان اليوم فصلاً، ما عنوانه؟", de: "Wenn heute ein Kapitel wäre, wie würde es heißen?", es: "Si hoy fuera un capítulo, ¿cuál sería su título?", fr: "Si aujourd'hui était un chapitre, quel en serait le titre ?", it: "Se oggi fosse un capitolo, qual sarebbe il suo titolo?", ja: "もし今日が一章なら、タイトルは何ですか？", ko: "오늘이 한 챕터라면 제목은 무엇일까요?", pl: "Gdyby dzisiejszy dzień był rozdziałem, jaki miałby tytuł?", pt: "Se hoje fosse um capítulo, qual seria seu título?", ro: "Dacă azi ar fi un capitol, care ar fi titlul lui?", ru: "Если бы сегодня была глава, как бы она называлась?", "zh-Hans": "如果今天是一个章节，它的标题会是什么？" },
  q085: { ar: "ما الذي لا تزال تعالجه نفسياً؟", de: "Was verarbeitest du noch?", es: "¿Qué estás todavía procesando?", fr: "Qu'êtes-vous encore en train d'assimiler ?", it: "Cosa stai ancora elaborando?", ja: "まだ処理中のことは何ですか？", ko: "아직 처리 중인 것은 무엇입니까?", pl: "Co wciąż przetwarzasz?", pt: "O que você ainda está processando?", ro: "Ce mai procesezi încă?", ru: "Что ты до сих пор переживаешь?", "zh-Hans": "你还在消化什么？" },
  q086: { ar: "ما الذي يبدو غير مكتمل؟", de: "Was fühlt sich unvollendet an?", es: "¿Qué se siente incompleto?", fr: "Qu'est-ce qui vous semble inachevé ?", it: "Cosa sembra incompiuto?", ja: "未完成のように感じるものは何ですか？", ko: "무엇이 미완성처럼 느껴집니까?", pl: "Co wydaje się niedokończone?", pt: "O que parece inacabado?", ro: "Ce pare neterminat?", ru: "Что кажется незавершённым?", "zh-Hans": "什么感觉是未完成的？" },
  q087: { ar: "ما اللحظة التي تتمنى لو يمكنك إعادة تعيشها؟", de: "Welchen Moment würdest du gerne noch einmal erleben?", es: "¿Qué momento desearías poder revivir?", fr: "Quel moment aimeriez-vous revivre ?", it: "Quale momento vorresti rivivere?", ja: "もう一度体験したい瞬間は何ですか？", ko: "다시 경험하고 싶은 순간은 무엇입니까?", pl: "Jaki moment chciałbyś przeżyć jeszcze raz?", pt: "Qual momento você gostaria de poder reviver?", ro: "Ce moment ai vrea să retrăiești?", ru: "Какой момент ты хотел бы пережить снова?", "zh-Hans": "你希望能重温哪个时刻？" },
  q088: { ar: "ما المحادثة التي لا تزال تتردد في ذهنك؟", de: "Welches Gespräch hängt noch bei dir nach?", es: "¿Qué conversación sigue contigo?", fr: "Quelle conversation continue-t-elle à vous habiter ?", it: "Quale conversazione continua a rimanere con te?", ja: "頭から離れない会話は何ですか？", ko: "어떤 대화가 계속 머릿속에 맴돌고 있습니까?", pl: "Jaka rozmowa wciąż przy tobie zostaje?", pt: "Qual conversa continua com você?", ro: "Ce conversație persistă în mintea ta?", ru: "Какой разговор не выходит у тебя из головы?", "zh-Hans": "什么对话在你脑海中萦绕不去？" },
  q089: { ar: "ما الذي تلاحظه عن أنماطك؟", de: "Was bemerkst du an deinen Mustern?", es: "¿Qué estás notando sobre tus patrones?", fr: "Que remarquez-vous à propos de vos schémas ?", it: "Cosa noti riguardo ai tuoi schemi?", ja: "自分のパターンについて何に気づいていますか？", ko: "당신의 패턴에 대해 무엇을 알아채고 있습니까?", pl: "Co zauważasz w swoich wzorcach?", pt: "O que você está notando sobre seus padrões?", ro: "Ce observi despre tiparele tale?", ru: "Что ты замечаешь в своих паттернах?", "zh-Hans": "你注意到自己的哪些规律？" },
  q090: { ar: "ما الذي ستفعله بشكل مختلف غداً؟", de: "Was wirst du morgen anders machen?", es: "¿Qué harás diferente mañana?", fr: "Que ferez-vous différemment demain ?", it: "Cosa farai diversamente domani?", ja: "明日は何を違うようにしますか？", ko: "내일은 무엇을 다르게 하겠습니까?", pl: "Co zrobisz jutro inaczej?", pt: "O que você fará diferente amanhã?", ro: "Ce vei face diferit mâine?", ru: "Что ты сделаешь завтра иначе?", "zh-Hans": "明天你会有什么不同的做法？" },
};

async function seedTranslations(): Promise<void> {
  // Categories — update by slug
  for (const [slug, translations] of Object.entries(CATEGORY_TRANSLATIONS)) {
    await sql`
      UPDATE question_categories
      SET translations = translations || ${JSON.stringify(translations)}::jsonb
      WHERE slug = ${slug} AND (translations = '{}' OR translations IS NULL)
    `;
  }

  // Questions — update by id
  for (const [id, translations] of Object.entries(QUESTION_TRANSLATIONS)) {
    await sql`
      UPDATE questions
      SET translations = translations || ${JSON.stringify(translations)}::jsonb
      WHERE id = ${id} AND (translations = '{}' OR translations IS NULL)
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

  console.log("[migrate] seeding translations…");
  await seedTranslations();
  console.log("[migrate] translations OK");

  console.log("[migrate] all done");
}
