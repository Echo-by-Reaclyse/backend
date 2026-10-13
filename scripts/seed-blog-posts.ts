/**
 * Seeds all existing static blog posts into the blog_posts table.
 * Run once with: npx tsx scripts/seed-blog-posts.ts
 * (from the backend/ directory, with DATABASE_URL in your .env)
 * Safe to re-run — uses ON CONFLICT DO NOTHING.
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

const posts = [
  {
    slug: "voice-journaling-prompts",
    title: "35 voice journaling prompts to answer out loud",
    search_title: "35 Voice Journaling Prompts to Answer Out Loud | ÉCHO Journal",
    description: "35 short voice journaling prompts in seven groups: evening, anxious days, gratitude, big decisions, self-discovery, relationships and your future self. Copy one and start.",
    excerpt: "Seven groups of short questions for evenings, anxious days, decisions and more. Copy one and begin.",
    date: "2026-10-08",
    reading_time: "5 min read",
    author: "The ÉCHO Team",
    topic: "prompts",
    card_visual: { type: "image" },
    in_short: null,
    sections: [],
    related_slugs: [],
  },
  {
    slug: "what-is-voice-journaling",
    title: "What is voice journaling? A simple way to start",
    search_title: "What Is Voice Journaling? A Simple Way to Start | ÉCHO Journal",
    description: "What voice journaling is, how to make your first recording, what to say, what to do when words don't come, and what to check before choosing an app.",
    excerpt: "What it is, how to make your first recording, what to say, and what to do when the words don't come.",
    date: "2026-05-12",
    reading_time: "6 min read",
    author: "The ÉCHO Team",
    topic: "voice",
    card_visual: { type: "image" },
    in_short: "Voice journaling is speaking your thoughts into a recording, usually for a few minutes, often in answer to one question. You can start with your phone's built-in recorder: pick a quiet moment, ask yourself one question, talk until you have said what you need to, and listen back another day.",
    related_slugs: ["voice-journaling-vs-writing", "build-journaling-habit", "how-to-reflect-on-your-day"],
    sections: [
      { body: "Voice journaling is speaking your thoughts aloud into a recording instead of writing them down. The longer version: it feels closer to thinking out loud to a trusted friend than filling in a diary. You press record, answer a question, and stop. No formatting, no backspacing, no rereading what you wrote and deciding it sounds wrong.\n\nMost people who try it for the first time say something they did not know they thought. The act of speaking, with no delete key and no audience, creates a kind of honesty that a notebook rarely produces." },
      { heading: "Your first recording can be this simple.", body: "You do not need an interesting day or a polished story. Try describing something you noticed, a question on your mind, or a moment you want to remember.", type: "steps", steps: [{ num: "01", title: "Choose a moment.", body: "Find somewhere you feel comfortable speaking. A short pause is enough." }, { num: "02", title: "Pick one question.", body: "Start with \"What stayed with me today?\" rather than trying to cover everything." }, { num: "03", title: "Speak, then stop.", body: "Try a minute. Keep going only if you feel like it. Decide what to save." }], kicker: "What a first reflection could sound like", prompt: "What stayed with me today?", quote: "\"I kept saying yes at work, even when I needed a pause. Tomorrow, I want to leave room for one thing that matters to me.\"", disclaimer: "Illustrative example, not a real user entry.", afterBody: "You can pause, start again, or leave a thought unfinished. This is a personal record, not a performance. You do not have to listen back immediately.", link: { text: "Find a question in the prompt library.", to: "/blog/voice-journaling-prompts" } },
      { heading: "Speaking or writing? Choose what fits.", body: "Neither needs to replace the other. The useful question is which format feels comfortable and practical in the moment.", type: "comparison", left: { label: "Try speaking when", heading: "The words come more easily out loud.", body: "You have a private place to speak and want to keep a thought without typing it out." }, right: { label: "Try writing when", heading: "You want quiet or more control over the text.", body: "You are in a shared space, prefer shaping a sentence, or would rather not record your voice." }, note: "It is also fine to use both. Your practice does not need to look the same every day." },
      { heading: "Return to one reflection, not everything.", body: "When you feel ready, choose a single entry rather than trying to review your whole journal. Listen to it or read the text if a transcript is available.", type: "blockquote", lines: ["Do I still feel this way?", "What has changed?", "What would I like to come back to?"], afterBody: "You do not need to find a lesson in every entry. Sometimes keeping a moment is enough." },
      { type: "invite", kicker: "Curious about ÉCHO?", heading: "A space for your own words.", ctaBody: "Explore the voice journal and see whether it fits your practice.", ctaText: "Explore ÉCHO" },
      { heading: "Before choosing an app, ask a few practical questions.", body: "Check where recordings and transcripts are stored, what processing happens on the device or elsewhere, and how to delete your data. These details can differ between apps.", type: "tags", tags: ["Recording & transcription", "Storage & access", "Processing & deletion"], afterBody: "Read the product's current explanations rather than assuming the word \"private\" covers every part of the process." },
      { heading: "Common questions", type: "faq", faqs: [{ q: "Do I need a special app?", a: "No. You can start by recording a short reflection with a basic recorder. A dedicated journal may offer ways to organise and revisit entries. Check what is actually included before choosing one." }, { q: "How long should I speak for?", a: "Sixty to ninety seconds is enough for most days. The value is not in length but in honesty. Say the one thing you are actually thinking about, then stop." }, { q: "Do I have to listen to my own voice?", a: "Not immediately. Many people find it easier to read the transcript first. Listening back is where much of the value lives, but start there after a few entries, not on day one." }, { q: "What if I do not know what to say?", a: "Start with one sentence: 'The thing that is still on my mind right now is…' Let the rest follow. If nothing comes, say that. It is usually the beginning of something." }] },
    ],
  },
  {
    slug: "voice-journaling-vs-writing",
    title: "Voice journaling or writing? How to choose what suits you",
    search_title: "Voice journaling or writing? How to choose what suits you | ÉCHO Journal",
    description: "Speaking and writing each have strengths. A practical look at when each one helps, with no single right answer.",
    excerpt: "Speaking and writing each have strengths. A practical look at when each one helps, with no single right answer.",
    date: "2026-05-19",
    reading_time: "6 min read",
    author: "The ÉCHO Team",
    topic: "voice",
    card_visual: { type: "image" },
    in_short: "Voice journaling and writing both have real benefits. Voice is faster and produces more honest first responses; writing allows more careful thinking. Most people find both useful for different things. The format that you actually maintain consistently matters more than which one is theoretically superior.",
    related_slugs: ["what-is-voice-journaling", "how-to-process-emotions", "how-to-reflect-on-your-day"],
    sections: [
      { body: "There is a widespread assumption that written journals are the more serious, more worthwhile form of self-reflection. Centuries of tradition back this up. Marcus Aurelius wrote. Virginia Woolf wrote. The diary has cultural prestige that voice memos do not.\n\nBut prestige and usefulness are different things. When you sit down to write about a hard conversation you had today, the version that reaches the page is already a revision. It has been cleaned up, given a narrative arc, made more coherent than the actual experience was." },
      { heading: "The inner editor problem.", body: "Every person who writes has an inner editor running in parallel. It monitors sentence structure, softens language that feels too exposed, and organises thoughts into something coherent before they have fully formed. In the context of private self-reflection, it is a bug.\n\nWhen you are journaling about something genuinely difficult — a relationship that is not working, an ambition you are afraid to admit — the inner editor is most active precisely when you need it least. Voice journaling does not solve this completely, but it reduces it significantly." },
      { heading: "What research says about verbal expression.", body: "Verbal externalisation has a substantial evidence base in clinical psychology. Talk therapy in its many forms is built on the principle that verbalising internal experience changes how we process it. Speaking activates different neural pathways than silent rumination.\n\nThe comparison with writing is more nuanced. Written expressive therapy, studied by James Pennebaker since the 1980s, also has real benefits. But the mechanism is the act of finding words for an experience — not the written medium itself — that matters. Voice journaling captures that same mechanism while removing the friction of the blank page." },
      { heading: "Writing's genuine strengths.", body: "This is not an argument that writing is inferior. Written journals have real advantages. The slower pace of writing forces you to find the right words, and that search can itself generate insight. Rereading written entries is faster than listening to recordings.", type: "blockquote", lines: ["For synthesis and goal-setting, writing is often more useful.", "It is harder to write \"I am going to leave this job\" and dismiss it than it is to say it."], afterBody: "For decisions, commitments, and capturing things you want to return to in polished form — writing wins. These are genuine strengths, not to be dismissed." },
      { heading: "Where voice journaling wins.", body: "Voice journaling has a specific advantage in three situations.", type: "comparison", left: { label: "Voice journaling is better for", heading: "Emotional immediacy and honesty.", body: "When you are still inside an experience, speaking captures it in a way writing rarely does. The voice records the feeling, not just the description of it." }, right: { label: "Writing is better for", heading: "Decisions and careful thinking.", body: "The slower pace forces commitment. It is harder to write something down and dismiss it. For goal-setting and synthesis, writing wins." }, note: "The choice does not have to be permanent. A useful experiment: try addressing the same recurring concern in writing for a week, then voice for a week." },
      { heading: "Which format is right for you.", body: "The honest answer is probably both, for different things. Many people find that voice journaling handles the daily emotional texture of life, while writing handles the moments that need careful thought.\n\nIf you can only choose one, ask yourself: am I more likely to maintain a practice that takes two minutes and requires nothing but my voice, or one that requires a surface, pen, and the decision of what to write? The format you actually maintain consistently matters more than which one is theoretically superior." },
    ],
  },
  {
    slug: "daily-reflection-questions",
    title: "5 daily reflection questions worth asking",
    search_title: "5 daily reflection questions worth asking | ÉCHO Journal",
    description: "Five questions that go past \"how was your day\", and how to use them without turning reflection into homework.",
    excerpt: "Five questions that go past \"how was your day\", and how to use them without turning reflection into homework.",
    date: "2026-05-26",
    reading_time: "8 min read",
    author: "The ÉCHO Team",
    topic: "prompts",
    card_visual: { type: "image" },
    in_short: "Five questions that angle toward what you did not notice at the time: what you were wrong about, what you wanted to say but didn't, what you are avoiding, who you thought about, and what you know now that you did not this morning.",
    related_slugs: ["how-to-reflect-on-your-day", "journaling-for-anxiety", "build-journaling-habit"],
    sections: [
      { body: "Most reflection questions are too safe. They invite you to revisit what you already know and confirm what you already believe. \"What went well today?\" \"What are you grateful for?\" These are not bad questions. But they tend to produce predictable answers — and predictable answers do not change how you think.\n\nThe questions below are chosen for a specific quality: they approach experience from an angle you are not expecting." },
      { heading: "1. What was I wrong about today?", body: "This question is useful precisely because almost nobody asks it. The standard review of a day focuses on what happened and how it felt. This question looks for where your model of the world did not match reality.\n\nYou were wrong about how a meeting would go. Wrong about how someone would respond. Most of these small wrongnesses get smoothed over by the end of the day. Naming them explicitly is where the learning actually lives.", kicker: "Why this question works", quote: "The practice is not about self-criticism. It is about calibration. If you never notice where your predictions were off, you cannot update them." },
      { heading: "2. What did I want to say that I didn't?", body: "The gap between felt and expressed is one of the most consistently underexplored areas of daily experience. You wanted to disagree with someone but did not. You wanted to express appreciation but it felt awkward.\n\nThese unexpressed thoughts do not disappear. They tend to accumulate and occasionally surface in ways that are disproportionate to the original situation." },
      { heading: "3. What am I avoiding thinking about?", body: "This is the hardest question on the list, and the most productive. The mind is skilled at keeping certain topics out of active consideration. There is usually a reason: the topic is unresolved, uncomfortable, or requires a decision you are not ready to make.", type: "blockquote", lines: ["The question itself tends to create a small gap in the avoidance —", "a moment where the topic becomes just visible enough to name.", "That is usually enough to start."] },
      { heading: "4. Who did I think about today and why?", body: "People appear in your thinking for reasons. A colleague you found yourself thinking about at an odd moment. A friend you have not spoken to in months. These appearances are not random, even when they seem that way.\n\nThis question traces those appearances back to their causes. Often the person you thought about is connected to something unresolved, something you want, or something you are working through." },
      { heading: "5. What do I know now that I did not know this morning?", body: "Every day produces new information. Most of it gets filed under general experience and is not examined closely. This question asks you to name what actually changed, specifically and concretely.\n\nThe question works best when you resist the temptation to answer with something general. \"I learned that communication is important\" is not an answer. \"I learned that I respond very badly when someone contradicts me in public\" is an answer." },
      { heading: "How to use these questions.", body: "You do not need to answer all five every day. Pick one. Rotate them through the week, or return to the same one until you have exhausted what it has to show you.", type: "tags", tags: ["Daily habit", "Evening reflection", "Anxious days", "One question at a time"], afterBody: "The medium matters less than the honesty. But speaking tends to produce the most honest version of the answer, before the editing process has a chance to intervene." },
    ],
  },
  {
    slug: "build-journaling-habit",
    title: "How to build a journaling habit you can keep",
    search_title: "How to build a journaling habit you can keep | ÉCHO Journal",
    description: "Small anchors, short sessions, and what to do after you miss a day.",
    excerpt: "Small anchors, short sessions, and what to do after you miss a day.",
    date: "2026-06-03",
    reading_time: "6 min read",
    author: "The ÉCHO Team",
    topic: "prompts",
    card_visual: { type: "image" },
    in_short: "Most journaling habits fail because they require too many decisions to start. The fix is an anchor: attach reflection to something you already do reliably. Keep sessions to two minutes. If you miss a day, do not miss the next one.",
    related_slugs: ["what-is-voice-journaling", "how-to-reflect-on-your-day", "evening-journaling"],
    sections: [
      { body: "Most journaling habits die in the first two weeks. The pattern is consistent: you start with genuine motivation, maintain it for three to five days, miss one day because something came up, feel a vague guilt about the missed day, and then quietly stop.\n\nThis is not a discipline problem. Habits fail when they are too costly to initiate, too variable in their timing, or not immediately rewarding. Traditional journaling fails on all three counts. Voice journaling fails on fewer of them — but only if you set it up correctly." },
      { heading: "Why the blank page breaks habits.", body: "Written journaling fails as a daily habit for a specific reason: the blank page requires too many decisions before you can start. What should I write about? Is this the right time? Do I have enough to say today? These micro-decisions create enough friction that the habit never becomes automatic.\n\nA true habit runs below the level of deliberate choice. You brush your teeth without deciding to brush your teeth. Journaling rarely reaches this point because the starting conditions are too variable." },
      { heading: "The anchor principle.", body: "The single most effective technique for building any daily habit is anchoring it to an existing behaviour. You do not add a new action to your day; you attach it to something you already do reliably.", type: "steps", steps: [{ num: "01", title: "Find your anchor.", body: "Pick something you already do without thinking: setting your alarm, closing your laptop, parking the car." }, { num: "02", title: "Attach the habit.", body: "The moment the anchor happens, open the app and press record. No decisions. The anchor is the trigger." }, { num: "03", title: "Keep it under two minutes.", body: "One question. One answer. Done before your brain has registered that the habit started." }], afterBody: "The anchor does not need to be at the ideal time of day. It needs to be reliable. A slightly imperfect reflection done consistently is worth considerably more than a well-timed one done occasionally." },
      { heading: "What to do when you miss a day.", body: "Missing a day is inevitable. The most common response is to treat it as a failure that must be compensated for — either by doing twice as much the next day or by feeling guilty enough that the guilt eventually breaks the habit entirely. Neither of these is useful.", type: "blockquote", lines: ["Missing one day is fine.", "Missing two days in a row is the danger zone.", "The only rule: do not miss the next one."], afterBody: "That is the whole recovery protocol. Research on habit formation suggests that a single break does not disrupt a habit, but two consecutive breaks begin to create a new pattern." },
      { heading: "The long view.", body: "The benefits of a daily reflection practice are not immediate. The early weeks produce very little that feels useful. The entries are tentative. The observations are obvious. The habit feels like effort without obvious return.\n\nThe return comes from accumulation. After a month of daily entries, you start to notice patterns that no single entry could have revealed. The recurring concern that surfaces every Sunday evening. The three or four topics that account for most of your thinking. This kind of self-knowledge is only available in the retrospective view across time." },
    ],
  },
  {
    slug: "best-journaling-apps-iphone-2026",
    title: "Journaling apps for iPhone compared (2026)",
    search_title: "Journaling apps for iPhone compared (2026) | ÉCHO Journal",
    description: "Day One, Reflectly, Rosebud, Journey and ÉCHO: what each one does, who it suits, and how we compared them.",
    excerpt: "Day One, Reflectly, Rosebud, Journey and ÉCHO: what each one does, who it suits, and how we compared them.",
    date: "2026-06-10",
    reading_time: "9 min read",
    author: "The ÉCHO Team",
    topic: "privacy",
    card_visual: { type: "image" },
    in_short: "Five iPhone journaling apps compared: Day One (best for written journaling), Reflectly (best for guided check-ins), Rosebud (best for AI-assisted reflection), Journey (best for cross-platform), and ÉCHO (built specifically for daily spoken reflection with on-device privacy). ÉCHO is our product; take the comparison with that in mind.",
    related_slugs: ["what-is-voice-journaling", "private-journaling-app", "build-journaling-habit"],
    sections: [
      { body: "The journaling app market has changed significantly in the last two years. AI features are now standard rather than novel, and the meaningful differences between apps are harder to identify from App Store screenshots alone.\n\nA note on bias: ÉCHO is one of the apps listed here, and this article is written by the ÉCHO team. We have tried to be accurate about the competition, but you should weigh that context appropriately." },
      { heading: "Day One.", body: "Day One is the longest-established journaling app on the list and remains the most capable for traditional written journaling. It is polished, reliable, and full-featured: photos, location tracking, multiple journals, strong encryption, and sync across devices.\n\nWhere it falls short: the voice journaling features are add-ons rather than the native mode. If all you want is a daily spoken reflection practice, the app can feel heavy.", kicker: "Best for", quote: "Committed writers who want a private, permanent digital journal with a long track record.", link: { text: "ÉCHO vs Day One — full comparison →", to: "/vs/day-one" } },
      { heading: "Reflectly.", body: "Reflectly is designed as a guided wellness journal. It structures entries around mood check-ins, daily questions, and gratitude prompts. The interface is warm and works well for people who respond to positive reinforcement that traditional journaling does not provide.\n\nThe tradeoff is depth. Reflectly is very good at making reflection feel manageable, but the prompts are predictable and the entries tend toward the surface-level.", kicker: "Best for", quote: "Beginners who want a gentle, structured starting point and respond to encouragement.", link: { text: "ÉCHO vs Reflectly — full comparison →", to: "/vs/reflectly" } },
      { heading: "Rosebud.", body: "Rosebud is the most AI-forward app in this comparison. It functions partly as a journal and partly as a conversational self-coaching tool. You write or speak an entry, and the app responds with questions designed to deepen the reflection.\n\nThe privacy model is less clear than it should be. The conversational AI feature requires sending entries to a server for processing. For people with genuinely private things to work through, that is a meaningful consideration.", kicker: "Best for", quote: "People who find the blank page difficult and benefit from being prompted to go further.", link: { text: "ÉCHO vs Rosebud — full comparison →", to: "/vs/rosebud" } },
      { heading: "Journey.", body: "Journey sits somewhere between Day One and a wellness app. It supports written entries, photos, and voice memos, with a more streamlined interface. The cross-platform support is strong: it works well on Android as well as iOS.\n\nJourney does many things adequately without doing any single thing as well as the most specialised apps on this list. It is a reasonable choice if cross-platform sync is a priority.", kicker: "Best for", quote: "Users who switch between iOS and Android and need reliable cross-platform sync.", link: { text: "ÉCHO vs Journey — full comparison →", to: "/vs/journey" } },
      { heading: "ÉCHO.", body: "ÉCHO is built around voice journaling specifically. The core idea is one question per day, answered by speaking rather than writing, with transcription done on your device so no audio leaves your phone.\n\nWhere it falls short: if you want rich written journaling with photo attachments and multiple journals, ÉCHO is not the right tool. It is built specifically for the person who wants to understand themselves better through daily spoken reflection.", kicker: "Best for", quote: "Daily spoken reflection with on-device privacy and long-term pattern recognition." },
      { heading: "How to choose.", body: "The right app depends almost entirely on what you are trying to do.", type: "comparison", left: { label: "Choose voice journaling if", heading: "Speed and honesty matter more than polish.", body: "You want the raw, immediate version of your thoughts — not the version your inner editor approved first." }, right: { label: "Choose written journaling if", heading: "Depth and revisability matter most.", body: "You want to craft, refine, and return to your writing. You keep a journal that is also, in some sense, a document." }, note: "All five apps have free trials or free tiers. The most reliable way to find out which fits is to use one for a week." },
      { type: "callout", kicker: "COMPARE IN DEPTH", quote: "We've written detailed head-to-head comparisons for each app — features, pricing, and who each one is really for.", afterBody: "→ ÉCHO vs Day One  ·  ÉCHO vs Reflectly  ·  ÉCHO vs Rosebud  ·  ÉCHO vs Journey  ·  ÉCHO vs ChatGPT  ·  ÉCHO vs Apple Journal", link: { text: "Start with ÉCHO vs Day One →", to: "/vs/day-one" } },
    ],
  },
  {
    slug: "journaling-for-anxiety",
    title: "Journaling on anxious days: what to try, and its limits",
    search_title: "Journaling on anxious days: what to try, and its limits | ÉCHO Journal",
    description: "Gentle ways to put a worry into words, and when to reach out for support instead.",
    excerpt: "Gentle ways to put a worry into words, and when to reach out for support instead.",
    date: "2026-07-01",
    reading_time: "8 min read",
    author: "The ÉCHO Team",
    topic: "reflect",
    card_visual: { type: "image" },
    in_short: "Speaking a worry out loud can help interrupt the loop of anxious thinking. Voice journaling works for everyday anxiety; it is not a substitute for professional support. If anxiety is frequent or significantly affecting your life, speak to a GP or mental health professional first.",
    related_slugs: ["how-to-process-emotions", "evening-journaling", "how-to-reflect-on-your-day"],
    sections: [
      { body: "Anxiety produces a specific kind of thought: the loop. The same concern circulates, gaining no new information, arriving at no resolution, returning slightly worse than it left. Most advice about anxiety suggests journaling as a remedy. Write it out. Get it on the page.\n\nFor many people with anxious minds, writing can extend the loop rather than break it. The editing process that writing involves can in some cases resemble rumination. Speaking the thought out loud, by contrast, externalises it differently." },
      { heading: "What verbal externalisation actually does.", body: "Speaking a thought out loud creates distance between the thinker and the thought in real time, without allowing revision. The spoken version of a worry is always slightly less polished than the written version. It is interrupted by pauses, by course corrections, by the simple awkwardness of saying something you have only previously thought. That friction is a feature.", kicker: "What research suggests", quote: "Naming and externalising a feeling out loud activates the thinking brain in a way that staying inside the feeling does not." },
      { heading: "What to say when you are anxious.", body: "This is where most advice gets vague. \"Talk about your feelings\" is not a usable instruction for an anxious mind. Specific is better.", type: "steps", steps: [{ num: "01", title: "Start with the physical.", body: "Describe what anxiety feels like in the body: a tight chest, a clenched jaw, faster-than-normal thoughts. Ground the observation in something concrete." }, { num: "02", title: "Name the worry in one sentence.", body: "Not the implications, not the what-ifs. Just the core concern. One sentence. If you generate more, stop — that is the loop starting again." }, { num: "03", title: "Say what you actually know.", body: "Not what you fear — what you know. This is often shorter than the worry sentence, which is informative in itself." }] },
      { heading: "The one-day-later effect.", body: "One underappreciated benefit of voice journaling for anxiety is not the act of speaking, but the ability to listen back later. When you listen to a recording you made at the height of an anxious state, you hear it from the outside. You hear the voice of someone who survived that state. You hear how it ended.", type: "blockquote", lines: ["The recording has duration.", "The fact that it ended tells you something."], afterBody: "Many people report that listening back to anxious recordings, even from a week earlier, produces a kind of compassion for themselves that reading a written entry does not." },
      { heading: "What voice journaling cannot do.", body: "Voice journaling is not therapy. It does not address the structural causes of anxiety: sleep debt, unresolved conflict, a work situation that needs to change. It does not provide the challenge-and-response of a skilled therapist.\n\nIf your anxiety is severe, frequent, or significantly affecting your daily life, the right first step is a conversation with a GP or mental health professional, not an app. ÉCHO is a reflection tool, not a clinical intervention." },
    ],
  },
  {
    slug: "how-to-process-emotions",
    title: "How to process emotions: what it means to work through a feeling",
    search_title: "How to process emotions: what it means to work through a feeling | ÉCHO Journal",
    description: "The difference between feeling something and working through it, with a simple three-step approach.",
    excerpt: "The difference between feeling something and working through it, with a simple three-step approach.",
    date: "2026-07-15",
    reading_time: "7 min read",
    author: "The ÉCHO Team",
    topic: "reflect",
    card_visual: { type: "image" },
    in_short: "Processing an emotion means externalising it in some form — through words, voice, or movement — until it loses its charge. Three steps that help: name the feeling precisely, trace it to its source (not its narrative extension), then say what you actually want.",
    related_slugs: ["journaling-for-anxiety", "voice-journaling-vs-writing", "daily-reflection-questions"],
    sections: [
      { body: "\"Process your emotions\" is one of those phrases that sounds meaningful until you try to do it. What does processing actually mean? In therapy, it means revisiting a difficult experience with a skilled guide until it loses its charge. Outside a therapist's office, it mostly means: do not ignore it. Do something with it before you go to bed.\n\nFor most people, that vague instruction produces either excessive rumination, or surface-level acknowledgment that quickly slides back to avoidance." },
      { heading: "The difference between feeling and processing.", body: "Feeling an emotion and processing it are not the same thing. You can feel resentful toward someone without ever tracing that resentment to its source. Feeling is automatic. Processing requires something deliberate: a moment of attention, a frame, and some form of externalisation.\n\nExternalisation is the act of moving a feeling from inside to outside — into words, into sound, into motion. The specific method matters less than the act of getting it out of the loop of internal processing and into a form you can observe.", type: "comparison", left: { label: "Feeling", heading: "Automatic and internal.", body: "You can feel anxious for years without understanding what you are anxious about. The loop continues unchecked." }, right: { label: "Processing", heading: "Deliberate and external.", body: "You name it, trace it to its source, and say what you want. The loop has a chance to close." } },
      { heading: "A three-step process that works.", body: "Not every emotional experience needs the same amount of processing. But for anything still present after the immediate circumstances have resolved, a simple approach tends to help.", type: "steps", steps: [{ num: "01", title: "Name it precisely.", body: "Not \"I feel bad\" but \"I feel specifically disappointed because I expected something that did not happen.\" The more precise the label, the less charge it carries." }, { num: "02", title: "Say where it is from.", body: "Trace the emotion to a specific event or pattern, not the story you are constructing around it. That distinction limits its radius." }, { num: "03", title: "Say what you actually want.", body: "Not what you wish had happened — what, given that it happened, you actually want now. This converts processing into direction." }] },
      { heading: "Why voice journaling suits this particularly well.", body: "Writing has a limitation for emotional processing: the inner editor. When you write about a difficult emotion, the written version tends to be slightly more composed than the felt version. The contradictions and hesitations get smoothed in translation from thought to text.\n\nSpeaking out loud, with no backspace key, produces a less polished but more accurate record. The moments where you say something and immediately say, no, that's not quite right — those stay too. Those self-corrections are often where the real processing happens.", kicker: "Pennebaker's finding", quote: "Expressive writing reduces stress markers and improves long-term wellbeing. But voice removes the editorial layer that writing cannot." },
      { heading: "When this is not enough.", body: "Emotional processing through journaling works well for the everyday texture of experience. It does not work well for acute trauma, grief in its acute phases, or mental health conditions that require clinical support.\n\nIf the same emotional experiences return at the same intensity despite regular reflection, that is information. The loop closes because something structural changes — sometimes from insight, often from action, sometimes from a professional who can identify what is maintaining it." },
    ],
  },
  {
    slug: "evening-journaling",
    title: "Evening journaling: what it's good for",
    search_title: "Evening journaling: what it's good for | ÉCHO Journal",
    description: "What an end-of-day reflection can capture, how it compares with mornings, and how to fit it in.",
    excerpt: "What an end-of-day reflection can capture, how it compares with mornings, and how to fit it in.",
    date: "2026-08-05",
    reading_time: "6 min read",
    author: "The ÉCHO Team",
    topic: "prompts",
    card_visual: { type: "image" },
    in_short: "Evening journaling captures the felt experience of the day before sleep processes and edits it. Morning journaling captures the rested, more considered version. Both have genuine uses. If you can only do one, evenings capture something that is unavailable by morning.",
    related_slugs: ["how-to-reflect-on-your-day", "build-journaling-habit", "journaling-for-anxiety"],
    sections: [
      { body: "Morning journaling has good marketing. It is associated with productive routines, the 5am practice, the pages written before the day intrudes. The appeal is real: your mind is quiet, the day has not happened yet.\n\nEvening journaling has a different advantage: it produces something morning journaling structurally cannot — a record of what actually happened, captured before sleep processes and reorganises it." },
      { heading: "What sleep actually does to your memories.", body: "During sleep, particularly during REM phases, the brain replays the day's experiences, integrating them into existing memory structures and discarding what it judges as low priority. The brain decides what to keep, how to frame it, and how to connect it to existing beliefs.", type: "blockquote", lines: ["Sleep does not just rest the brain.", "It edits."], afterBody: "The version of today's difficult conversation that you will remember in a week is not the raw version. It is the version your brain processed overnight, smoothed into a narrative consistent with your existing models of yourself and others." },
      { heading: "What evening journaling captures.", body: "Evening journaling captures what morning journaling loses. When you record a voice note about the day's events before sleeping, you get the felt experience, not the memory of it. The conversation still has its original emotional texture. You have not yet decided what it means.", type: "comparison", left: { label: "Evening journaling", heading: "Raw, unedited, felt.", body: "Captures the specific word someone used, the pause before they said it, the unresolved uncertainty before sleep picks a side." }, right: { label: "Morning journaling", heading: "Processed, calmer, coherent.", body: "You write about yesterday, but yesterday has already been revised. More perspective, less reactivity — and less of the original texture." } },
      { heading: "The one-question approach.", body: "The mistake of evening journaling is turning it into a debrief. Recounting every event produces a log, not a reflection.", type: "faq", faqs: [{ q: "What was the moment I am still thinking about?", a: "Not the biggest event — the one that is still present. That persistence is usually pointing to something unresolved." }, { q: "What did I say yes to that I wanted to say no to?", a: "The gap between stated and felt preferences is often where the most useful self-knowledge lives." }, { q: "What surprised me today?", a: "Surprise reveals where your model of the world did not match reality. That is almost always worth a few minutes of attention." }] },
      { heading: "Why speaking beats writing at night.", body: "Writing at night requires light, a surface, and a level of wakefulness that a long day often does not leave. Speaking requires none of these. A voice note in bed, before you reach for your phone, takes less activation energy than any written practice.\n\nTiredness strips the editorial layer more effectively than almost anything else. The version of yourself that speaks at 10pm after a full day is less managed than the version that writes at 7am after coffee. The honesty that emerges from exhaustion is not always pretty, but it is often accurate." },
    ],
  },
  {
    slug: "private-journaling-app",
    title: "What \"private\" means in a journaling app, and what to check",
    search_title: "What "private" means in a journaling app, and what to check | ÉCHO Journal",
    description: "Questions to ask about recording, transcription, storage, AI processing and deletion before you trust an app with your thoughts.",
    excerpt: "Questions to ask about recording, transcription, storage, AI processing and deletion before you trust an app with your thoughts.",
    date: "2026-08-19",
    reading_time: "7 min read",
    author: "The ÉCHO Team",
    topic: "privacy",
    card_visual: { type: "image" },
    in_short: "Genuine privacy in a journaling app requires: on-device transcription (no audio leaves the device), encryption at rest you control, no use of your data to train AI models, and a real right to deletion. Most apps that use the word \"private\" do not meet all four criteria.",
    related_slugs: ["what-is-voice-journaling", "best-journaling-apps-iphone-2026", "build-journaling-habit"],
    sections: [
      { body: "Every journaling app calls itself private. Nobody would choose an app that admitted to reading your diary. The word private appears in marketing copy, App Store descriptions, and privacy policies, often without any technical substance behind it.\n\nGenuine privacy is rare. Most apps offer a version that is better described as \"we do not actively share your data\" — which is meaningfully different from \"your data is inaccessible to us.\"" },
      { heading: "The three questions that actually matter.", body: "Three questions cut through the marketing when evaluating whether a journaling app is genuinely private.", type: "steps", steps: [{ num: "01", title: "Where is your transcription processed?", body: "On your device, or on a server? Server-side means your voice has left your phone before you read a single word of the transcript." }, { num: "02", title: "Who can access your entries if asked?", body: "Most \"encrypted\" cloud storage stores data the company can still decrypt. A court order, breach, or rogue employee could access your entries." }, { num: "03", title: "Is your data used to train AI models?", body: "Many apps include a buried clause permitting use of your content to improve their AI systems. Read the actual privacy policy, not the marketing page." }] },
      { heading: "Encryption: what it protects and what it does not.", body: "Encryption is one of the most misused words in tech marketing.", type: "comparison", left: { label: "Encryption at rest or in transit", heading: "Protects against interception.", body: "Common, widely claimed. The company still holds the keys — meaning they (and courts) can still access your data." }, right: { label: "End-to-end encryption", heading: "Protects against the company itself.", body: "Only you hold the decryption keys. Rare in consumer apps. When an app says \"bank-level encryption\", it almost never means this." } },
      { heading: "What genuine privacy looks like.", body: "A genuinely private journaling app in 2026 should offer:", type: "tags", tags: ["On-device transcription", "On-device storage by default", "No AI training on user data", "Right to deletion (GDPR)", "Business model without data monetisation"], afterBody: "These are not aspirational. They are achievable with current technology. Apps that claim the \"private\" label should be evaluated against them specifically." },
      { heading: "Common questions about journaling app privacy.", type: "faq", faqs: [{ q: "What does 'on-device transcription' actually mean?", a: "Your voice is processed by a model running entirely on your phone. No audio leaves your device. The transcript is generated and stored locally. This is categorically different from cloud transcription, not marginally better but structurally different." }, { q: "How do I check an app's AI training policy?", a: "Read the privacy policy directly, not the marketing page. Search for words like 'train', 'improve', 'AI', and 'anonymise' in connection with user content. Any positive match is a significant qualification on the word 'private'." }, { q: "Is GDPR compliance meaningful for privacy?", a: "It means European users have a legal right to deletion and data portability. It does not mean the app is technically private. A GDPR-compliant app can still send your audio to a server for transcription. Look for both compliance and technical practices." }] },
    ],
  },
  {
    slug: "how-to-reflect-on-your-day",
    title: "How to reflect on your day: a 3-minute practice",
    search_title: "How to reflect on your day: a 3-minute practice | ÉCHO Journal",
    description: "A short end-of-day routine with three questions, and how reflections add up over time.",
    excerpt: "A short end-of-day routine with three questions, and how reflections add up over time.",
    date: "2026-09-09",
    reading_time: "6 min read",
    author: "The ÉCHO Team",
    topic: "reflect",
    card_visual: { type: "image" },
    in_short: "Three minutes, three questions: what moment am I still thinking about, what did I feel that I did not express, and what do I want tomorrow to contain that today did not. The value accumulates across months, not from individual sessions.",
    related_slugs: ["daily-reflection-questions", "build-journaling-habit", "evening-journaling"],
    sections: [
      { body: "Most advice about daily reflection assumes you have twenty minutes and a journaling practice that is already well established. For everyone else — full days, short evenings, a history of started-and-abandoned journals — the standard advice produces guilt more reliably than insight.\n\nThere is a shorter version that works. The quality of a reflection does not correlate with its length. The five-word answer to a well-chosen question produces more useful self-knowledge than a page of free association." },
      { heading: "Three questions worth asking.", body: "Three questions cover the essential ground of a useful daily reflection. Each can be answered in sixty seconds, and none of them asks you to summarise your day.", type: "steps", steps: [{ num: "01", title: "What was the moment I am still thinking about?", body: "Not the biggest event — the one that has persisted. Persistence is a reliable signal of significance." }, { num: "02", title: "What did I feel that I did not express?", body: "The thing you wanted to say but did not. The appreciation you felt but did not mention. These unexpressed feelings accumulate." }, { num: "03", title: "What do I want tomorrow to contain that today did not?", body: "Generative rather than corrective. It asks what you want, not what you regret." }], afterBody: "A summary is a log. A complaint is a loop. These three questions produce something different: a record of what you actually noticed, felt, and want." },
      { heading: "Why speaking is faster and more honest.", body: "Writing answers to these questions takes longer and produces a more polished version of what you actually think. The inner editor activates. The rough truth gets replaced by a slightly tidier approximation.\n\nSpeaking produces the rough truth faster. A sixty-second voice answer captures what you actually think — including the contradictions and hesitations — before you have decided what you are supposed to think.", kicker: "The practical edge", quote: "Speaking requires no light, no surface, no typing. The three-minute practice becomes possible in places where a three-minute writing practice would require setup." },
      { heading: "What changes over time.", body: "The immediate value of a three-minute daily reflection is modest. What changes is what becomes visible after a month of consistent entries.", type: "blockquote", lines: ["The thing you are still thinking about turns out to be one of two or three topics, rotating.", "The unexpressed emotion almost always involves the same person or situation.", "The forward-facing question produces the same answer, phrased slightly differently each time."], afterBody: "These patterns are the actual output of a daily reflection practice. Not individual insights, but accumulated evidence about your own recurring concerns, desires, and unresolved tensions." },
      { heading: "Building the anchor.", body: "A practice that depends on remembering to do it fails within a week. The solution is an anchor — a behaviour that already happens reliably — to which the reflection attaches.\n\nCommon anchors: the moment after setting an alarm for the next morning, the two minutes between brushing teeth and getting into bed, the end of a commute before getting out of the car.\n\nThe anchor does not need to be ideal timing. It needs to be reliable. A slightly imperfect reflection done consistently is worth more than an ideal one done three times a month." },
    ],
  },
];

async function run() {
  console.log(`Seeding ${posts.length} blog posts…`);
  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    const result = await sql`
      INSERT INTO blog_posts (
        slug, status, title, search_title, description, excerpt,
        topic, reading_time, author, in_short, card_visual, sections,
        related_slugs, published_at
      ) VALUES (
        ${post.slug},
        'published',
        ${post.title},
        ${post.search_title},
        ${post.description},
        ${post.excerpt},
        ${post.topic},
        ${post.reading_time},
        ${post.author},
        ${post.in_short ?? null},
        ${JSON.stringify(post.card_visual)},
        ${JSON.stringify(post.sections)},
        ${post.related_slugs},
        ${post.date}::date
      )
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `;
    if (result.length > 0) {
      console.log(`  ✅  ${post.slug}`);
      inserted++;
    } else {
      console.log(`  ⏭️   ${post.slug} (already exists)`);
      skipped++;
    }
  }

  console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
}

run().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
