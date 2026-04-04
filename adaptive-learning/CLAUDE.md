@AGENTS.md

# Adaptive Learning Course Template

This repo is a fully-featured AI-powered adaptive learning platform. It is a blank template — duplicate it and follow this guide to create a new course from any textbook.

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind CSS 4) deployed on **Vercel**
- **Supabase** for PostgreSQL database + Auth (SSO via Course Dashboard, Row Level Security)
- **Claude API** (Sonnet) for AI tutoring, quiz remediation, free-text evaluation, assignment coaching, and capstone drafting
- **jose** for JWT signing/verification (SSO)
- **Content** stored as static JSON in `content/chapters/` and `content/assignments/`
- **PyMuPDF** for PDF text and image extraction (used in content generation pipeline)

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/course.config.ts` | **Single source of truth** for course title, subtitle, AI tutor role, capstone config, thresholds, feature flags, attribution |
| `src/lib/scoreUtils.ts` | Shared grade/score utilities: `getLetterGrade()`, `getScoreColor()`, `getGradeColor()`, `getGradeBg()` — all driven by `courseConfig.thresholds` |
| `src/lib/content.ts` | Loads chapter/section/quiz/assignment JSON from filesystem — fully dynamic |
| `src/lib/types.ts` | TypeScript interfaces for all content JSON and database types |
| `src/lib/claude.ts` | Claude API client initialization |
| `src/lib/rateLimit.ts` | In-memory rate limiter for AI endpoints (15 req/min) |
| `src/lib/sso.ts` | JWT verification, dashboard URL, course slug constants |
| `src/lib/renderMarkdown.tsx` | Markdown-to-React renderer (supports `![alt](src)` image syntax) |
| `src/components/ContentRenderer.tsx` | Renders content blocks including `image` type with `<figure>` elements; supports TTS sentence highlighting |
| `src/components/MicrophoneButton.tsx` | Speech-to-text microphone button with first-visit tooltip (Web Speech API) |
| `src/components/Attribution.tsx` | OER/Creative Commons attribution footer — compact (every page) and full (detail) variants |
| `src/components/DownloadPDFButton.tsx` | "Download as PDF" button using browser print with optimized print CSS |
| `src/components/TTSController.tsx` | Text-to-speech audio player bar — fixed bottom, skip/pause/speed controls |
| `src/hooks/useSpeechToText.ts` | React hook wrapping SpeechRecognition API with auto-restart and error handling |
| `src/hooks/useTextToSpeech.ts` | React hook wrapping SpeechSynthesis API with sentence chunking, block tracking, mobile-optimized rates |
| `src/lib/stripMarkdown.ts` | Converts markdown to plain text for speech synthesis |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client (cookie-based) |
| `src/lib/supabase/admin.ts` | Admin client using service role key (for SSO user creation) |
| `src/lib/supabase/middleware.ts` | Auth middleware — redirects unauthenticated users to dashboard, enforces role-based routing |
| `src/app/auth/sso/route.ts` | SSO endpoint — verifies JWT, creates/updates user with correct role, generates session |
| `content/chapters/chNN/` | Chapter content: `meta.json`, `sections/`, `quizzes/`, `discussion.json` |
| `content/assignments/` | Assignment definition JSON files |
| `scripts/validate-content.ts` | Validates all content JSON matches expected interfaces |
| `scripts/extract-text.py` | Extracts text from PDF chapter by chapter (PyMuPDF) |
| `scripts/extract-images.py` | Extracts images from PDF chapter by chapter (PyMuPDF) |
| `scripts/curate-images.py` | Selects best images per section and embeds them as image blocks |
| `scripts/update-captions.py` | Improves image captions with section-contextual descriptions |
| `supabase/migrations/` | Database schema (7 migrations) — generic, works for any course |

## App Pages & Routes

### Student Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Landing page (redirects authenticated users by role) |
| `/chapters` | `src/app/chapters/page.tsx` | Student dashboard — chapter cards, assignment cards, capstone card, announcements, activity timeline |
| `/chapter/[chapterId]` | `src/app/chapter/[chapterId]/page.tsx` | Chapter overview |
| `/chapter/[chapterId]/[sectionId]` | `src/app/chapter/[chapterId]/[sectionId]/page.tsx` | Section learning flow (content, quiz gate, free-text prompt) |
| `/assignment/[assignmentId]` | `src/app/assignment/[assignmentId]/page.tsx` | Assignment workspace with AI coaching |
| `/business-plan` | `src/app/business-plan/page.tsx` | Final portfolio: executive summary, introduction, preview/print, submit |
| `/grades` | `src/app/grades/page.tsx` | Student grade view |
| `/certificate` | `src/app/certificate/page.tsx` | Completion certificate (unlocked when all content + portfolio submitted) |
| `/profile` | `src/app/profile/page.tsx` | User profile settings |
| `/search` | `src/app/search/page.tsx` | Content search |

### Instructor Pages
| Route | File | Purpose |
|-------|------|---------|
| `/instructor` | `src/app/instructor/page.tsx` | Instructor dashboard — class management, student roster, announcements, chapter analytics |
| `/instructor/student/[studentId]` | `src/app/instructor/student/[studentId]/page.tsx` | Individual student detail view |
| `/instructor/gradebook` | `src/app/instructor/gradebook/page.tsx` | Gradebook with CSV export |
| `/instructor/feedback` | `src/app/instructor/feedback/page.tsx` | Student satisfaction feedback analysis |

### Auth Pages (all redirect to Course Dashboard)
| Route | Purpose |
|-------|---------|
| `/login` | Redirects to `DASHBOARD_URL/courses/COURSE_SLUG` |
| `/signup` | Redirects to `DASHBOARD_URL/courses/COURSE_SLUG` |
| `/forgot-password` | Redirects to `DASHBOARD_URL/forgot-password` |
| `/reset-password` | Redirects to `DASHBOARD_URL/reset-password` |
| `/auth/sso` | SSO endpoint — receives JWT from dashboard, creates session, **upserts profile with role** |
| `/auth/callback` | OAuth callback handler (available for future use) |

### API Routes
| Route | Purpose |
|-------|---------|
| `POST /api/quiz/submit` | Submit gate quiz answers, returns score/pass status |
| `POST /api/remediation/generate` | AI-generated remediation content on quiz failure |
| `POST /api/free-text/evaluate` | AI evaluation of free-text responses |
| `POST /api/assignment/evaluate` | AI coaching/grading of assignment sections (scores 0-100) |
| `POST /api/assignment/draft-chat` | AI collaborative drafting assistant for assignments |
| `GET/POST /api/business-plan` | Load/save executive summary, introduction, portfolio submission flag |
| `POST /api/business-plan/draft-chat` | AI assistant for executive summary and introduction drafting |
| `POST /api/deep-dive` | AI deep-dive explanation of topics |
| `GET /api/certificate` | Generate certificate data |
| `GET /api/search` | Content search across chapters |
| `POST /api/feedback` | Student satisfaction survey submission |
| `GET/POST /api/activity` | Log/retrieve student activity |
| `GET/POST /api/announcements` | Student-facing announcement retrieval |
| `POST /api/announcements/read` | Mark announcement as read |
| `GET/POST /api/instructor/announcements` | Instructor announcement management |
| `GET /api/instructor/announcements/reads` | Announcement read receipts |
| `GET/POST /api/instructor/classes` | Create/list instructor classes with join codes |
| `GET /api/instructor/export` | Export grades as CSV |
| `POST /api/classes/join` | Student joins a class via join code |

## Creating a New Course (Step-by-Step)

### Step 1: Copy the Repo

```bash
# Copy this template into a new folder
cp -r course-template/ ../new-course-name/adaptive-learning/
cd ../new-course-name/adaptive-learning/
rm -rf .git .vercel .next node_modules
git init
npm install
```

Place the textbook PDF in the **parent directory** (e.g., `../new-course-name/textbook.pdf`).

### Step 2: Analyze the Textbook

The textbook PDF is often too large for direct reading. Use the text extraction pipeline:

1. Install PyMuPDF: `python3 -m pip install PyMuPDF`
2. Edit `scripts/extract-text.py`:
   - Set `PDF_FILENAME` to your textbook's filename
   - Set `CHAPTERS` dict with page ranges from the table of contents (0-indexed)
3. Run: `python3 scripts/extract-text.py all`
4. Read the extracted text from `scripts/extracted/chNN-raw.txt`

From the extracted text, identify:
- Total number of chapters
- Section titles within each chapter (e.g., "3.1 Global Trade", "3.2 Barriers to Trade")
- Key concepts, terms, and learning objectives per section

### Step 3: Update `src/lib/course.config.ts`

```typescript
export const COURSE_ID = process.env.COURSE_SLUG || 'your-course-slug';

export const courseConfig = {
  title: "Your Course Title",
  subtitle: "Adaptive Learning Platform",
  description: "Course description for the landing page.",
  textbook: {
    name: "Textbook Title (Author/Publisher)",
    pdfFilename: "textbook-filename.pdf",
  },
  capstone: {
    enabled: true,  // set false if no capstone project
    title: "Capstone Project Title",
    route: "/business-plan",
    navLabel: "Final Project",
  },
  aiTutor: {
    role: "a friendly [Course Subject] tutor at a community college",
    tone: "warm, supportive, and encouraging",
  },

  // Pass/fail thresholds (used across quizzes, free-text, grades)
  thresholds: {
    freeTextPass: 70,       // Minimum % to pass a free-text written response
    gradeA: 90,
    gradeB: 80,
    gradeC: 70,
    gradeD: 60,
  },

  // Feature toggles (disable features that don't apply to certain courses)
  features: {
    textToSpeech: true,
    speechToText: true,
    deepDive: true,
    askQuestion: true,
    draftChat: true,
  },

  // Attribution (required for OER/Creative Commons content)
  // Set enabled: false if the textbook is not OER-licensed
  attribution: {
    enabled: true,
    sourceTitle: "Textbook Title",
    sourceAuthors: "Author Names",
    sourceUrl: "https://openstax.org/details/books/your-book-slug",
    sourcePublisher: "OpenStax, Rice University",
    license: "CC BY 4.0",                                        // or "CC BY-NC-SA 4.0" — check the textbook
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",   // match the license above
    accessLine: "Access for free at openstax.org.",
    adaptedBy: "ES Designs",
    adaptationNote: "This adaptive learning platform adapts and remixes content from the original textbook with AI-powered tutoring, interactive quizzes, and written response evaluations.",
  },
};
```

**IMPORTANT — Attribution & Licensing:**
- All OpenStax textbooks require attribution on every page view (CC BY 4.0 or CC BY-NC-SA 4.0)
- The `Attribution` component in `layout.tsx` handles this automatically — it reads from `courseConfig.attribution`
- **CC BY-NC-SA 4.0** textbooks (e.g., Principles of Data Science) **cannot be used in paid courses** — the NC (non-commercial) clause prohibits charging for access
- **CC BY 4.0** textbooks can be adapted and monetized freely with proper attribution
- Check the textbook's copyright page (typically page 4) for the exact license

### Step 4: Delete Existing Content

```bash
rm -rf content/chapters/*
rm -rf content/assignments/*
rm -rf public/images/*
```

### Step 5: Generate Chapter Content

For each chapter, create the following files. Use the extracted textbook text as the source material.

#### `content/chapters/chNN/meta.json` (ChapterMeta)

```json
{
  "chapterId": 1,
  "title": "Chapter Title",
  "weekNum": 1,
  "reading": "Textbook Name, Chapter 1 (Sections 1.1-1.8)",
  "learningObjectives": [
    "Objective 1",
    "Objective 2"
  ],
  "sections": ["1.1", "1.2", "1.3"]
}
```

#### `content/chapters/chNN/sections/X.Y.json` (SectionContent)

```json
{
  "sectionId": "1.1",
  "chapterId": 1,
  "title": "Section Title",
  "learningObjectives": [
    "Specific objective for this section"
  ],
  "keyTerms": [
    { "term": "Term Name", "definition": "Clear, concise definition." }
  ],
  "contentBlocks": [
    {
      "type": "concept",
      "title": "Concept Heading",
      "body": "800-1200 words of content. Use **bold** for key terms. Use markdown formatting.\n\nBreak into logical paragraphs. Use > blockquotes for formulas or key principles.\n\nUse numbered lists for processes, bullet lists for categories."
    },
    {
      "type": "example",
      "title": "Real-World Example",
      "body": "A concrete, relatable example applying the concepts above."
    },
    {
      "type": "summary",
      "body": "2-3 sentence recap of key takeaways from this section."
    }
  ],
  "freeTextPrompt": {
    "id": "ft-1.1",
    "prompt": "Application-focused question that requires students to connect concepts to real situations. Should require 75+ words to answer well.",
    "minWords": 75,
    "rubric": "What a good answer should include. Be specific about which concepts must be addressed. This rubric is shown to students before they write via the 'What we're looking for' panel."
  }
}
```

**Content block types:**
- `concept` — Main instructional content (800-1200 words, 3-5 blocks per section)
- `example` — Real-world examples applying concepts
- `summary` — 2-3 sentence recap
- `image` — Embedded textbook image (added by curate-images.py, see Step 5b)

**Content Guidelines:**
- 3-5 content blocks per section (mix of concept, example, summary)
- 800-1200 words total across all blocks
- 3-8 key terms per section with clear definitions
- Use **bold** for vocabulary terms on first mention
- Free-text prompts should be application-focused, not recall
- Free-text `minWords` must be **75** (not 100 or 150) — this is the standard across all courses
- Free-text `rubric` is shown to students before writing via a collapsible "What we're looking for" panel — write it in student-friendly language

#### `content/chapters/chNN/quizzes/gate-X.Y.json` (GateQuiz)

```json
{
  "sectionId": "1.1",
  "chapterId": 1,
  "questions": [
    {
      "id": "ch01-q01",
      "question": "Question text that tests concepts from THIS section only?",
      "options": [
        { "text": "Wrong answer", "correct": false },
        { "text": "Correct answer", "correct": true },
        { "text": "Wrong answer", "correct": false },
        { "text": "Wrong answer", "correct": false }
      ],
      "explanation": "Why the correct answer is right, referencing section content."
    }
  ],
  "passThreshold": 80
}
```

**Quiz Guidelines:**
- 2 questions per section gate quiz
- 4 options per question, exactly 1 correct
- CRITICAL: Questions MUST test concepts from their own section, not other sections
- Include clear explanations that reinforce learning
- Question IDs: `chNN-qXX` (sequential within chapter)

#### `content/chapters/chNN/discussion.json` (DiscussionConfig)

```json
{
  "chapterId": 1,
  "weekNum": 1,
  "title": "Discussion Title",
  "prompt": "Discussion prompt connecting chapter concepts to real-world application.",
  "requirements": {
    "initialPost": { "minWords": 150, "maxWords": 200, "dueDay": "Wednesday", "dueTime": "11:59 PM ET" },
    "replies": { "count": 2, "minWords": 75, "maxWords": 100, "dueDay": "Sunday", "dueTime": "11:59 PM ET" }
  }
}
```

### Step 5b: Extract and Embed Textbook Images (Optional but Recommended)

This pipeline extracts images from the textbook PDF and embeds the best ones into section content.

#### 1. Extract images from PDF

Edit `scripts/extract-images.py`:
- Set `PDF_FILENAME` to your textbook filename
- Set `CHAPTERS` dict with the same page ranges as extract-text.py

```bash
python3 scripts/extract-images.py
# Output: public/images/chNN/ directories + public/images/manifest.json
```

#### 2. Curate and embed images into sections

Edit `scripts/curate-images.py`:
- Set `SECTION_PAGES` dict mapping each section to its page range (1-indexed)

```bash
python3 scripts/curate-images.py
# Output: image blocks inserted into section JSON files
```

#### 3. Improve captions

```bash
python3 scripts/update-captions.py
# Output: generic captions replaced with section-contextual descriptions
```

The image blocks use this format in contentBlocks:
```json
{
  "type": "image",
  "title": "Section Title — textbook illustration (p. 42)",
  "body": "",
  "imageSrc": "/images/ch01/fig-ch01-03.png",
  "imageAlt": "Screenshot illustrating section topic",
  "imageCaption": "Section Title — textbook illustration (p. 42)"
}
```

The `ContentRenderer` component handles image blocks with `<figure>` elements, lazy loading, and captions. The `renderMarkdown` function also supports inline `![alt](src)` image syntax.

### Step 6: Generate Assignments

Create `content/assignments/assignment-N.json`:

```json
{
  "assignmentId": 1,
  "title": "Assignment Title",
  "points": 150,
  "description": "What students will do in this assignment.",
  "relatedChapters": [1, 2, 3],
  "context": {
    "purpose": "Why this assignment matters.",
    "goals": ["Goal 1", "Goal 2"],
    "whatToExpect": "How the AI coaching works."
  },
  "sections": [
    {
      "key": "section-key",
      "title": "Section Title",
      "instructions": "What to write for this section.",
      "minWords": 75,
      "maxWords": 400,
      "rubric": "What a good answer includes.",
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}
```

**Assignment defaults:**
- `minWords`: **75** (recommended minimum for written responses)
- `maxWords`: 300-500 depending on complexity
- 4 sections per assignment is typical
- `points`: 150 per assignment is standard

### Step 7: Validate Content

```bash
npx tsx scripts/validate-content.ts
```

Fix any errors before proceeding. All 0 errors required.

### Step 8: Build and Test Locally

```bash
npm run build
npm run dev
```

Verify the app loads, chapters display correctly, quizzes work, and AI features respond.

### Step 9: Set Up Supabase

**If sharing an existing Supabase instance** (recommended — all course apps share one Supabase via the Course Dashboard):
- Point env vars to the shared Supabase project
- Migrations will mostly error because tables already exist — this is expected
- Only new migrations (unique to this template version) will succeed
- The shared tables (profiles, section_progress, etc.) are already set up

**If creating a new Supabase project:**
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run all migration files from `supabase/migrations/` in order:
   - `001_initial_schema.sql` — profiles, section_progress, quiz_attempts, free_text_responses, assignment_drafts, ai_interactions, discussion_posts + RLS
   - `002_instructor_rls_policies.sql` — initial instructor read policies (superseded by 003)
   - `003_fix_recursive_policies.sql` — creates `is_instructor()` SECURITY DEFINER function, recreates all instructor policies to avoid RLS recursion
   - `004_class_enrollment.sql` — `classes` and `class_enrollments` tables with join codes
   - `005_announcements.sql` — `announcements` table (class broadcast + individual messages)
   - `006_read_receipts_and_activity.sql` — `announcement_reads` and `activity_log` tables
   - `007_student_feedback.sql` — `student_feedback` table (satisfaction surveys)
3. Go to **Auth Settings** → enable Email/Password sign-in

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-claude-api-key
DASHBOARD_SSO_SECRET=your-shared-sso-secret
DASHBOARD_URL=https://courses.esdesigns.org
COURSE_SLUG=your-course-slug
```

Instructor accounts are created automatically via SSO. The SSO route upserts the profile with the correct role — dashboard users with role `admin` or `super_admin` are mapped to `instructor` in the course app.

### Step 10: Deploy to Vercel

```bash
# Push to GitHub first
git add -A
git commit -m "Initial course setup"
gh repo create YourUsername/Your-Course-Name --private --source . --push
```

In Vercel:
1. Import the GitHub repo
2. If the Next.js app is at the repo root, select root. If it's in a subfolder, select that.
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — needed for SSO user creation
   - `ANTHROPIC_API_KEY`
   - `DASHBOARD_SSO_SECRET` — must match the Course Dashboard's secret
   - `DASHBOARD_URL` — e.g. `https://courses.esdesigns.org`
   - `COURSE_SLUG` — this course's slug on the dashboard

### Step 11: Register the Course on the Course Dashboard

Run these SQL statements in the **Course Dashboard's Supabase** (not the course app's Supabase):

```sql
-- Step 1: Insert the course
INSERT INTO courses (
  slug, title, subtitle, description, short_description,
  module_count, estimated_hours, price_cents, app_url,
  is_published, course_type, tags
) VALUES (
  'your-course-slug',
  'Your Course Title',
  'Adaptive Learning Platform',
  'Full course description here.',
  'Short one-line description.',
  15,          -- number of chapters/modules
  45.0,        -- estimated hours
  0,           -- price in cents (0 = free)
  'https://your-course.vercel.app',
  true,
  'course',
  ARRAY['tag1', 'tag2', 'tag3']
);

-- Step 2: Link to your tenant
INSERT INTO tenant_courses (tenant_id, course_id, is_visible, sort_order)
VALUES (
  (SELECT id FROM tenants LIMIT 1),  -- or specify tenant_id directly
  (SELECT id FROM courses WHERE slug = 'your-course-slug'),
  true, 0
);

-- Step 3: Add course outline (chapter/section list for the course detail page)
UPDATE courses SET course_outline = '[
  {"title": "Chapter 1: Title", "items": ["1.1 Section Title", "1.2 Section Title"]},
  {"title": "Chapter 2: Title", "items": ["2.1 Section Title", "2.2 Section Title"]}
]'::jsonb
WHERE slug = 'your-course-slug';
```

### Step 12: Final Verification

- [ ] Landing page shows correct course title
- [ ] Unauthenticated users are redirected to the Course Dashboard (not a local login page)
- [ ] SSO login from dashboard creates user and redirects to `/chapters` (student) or `/instructor` (instructor)
- [ ] Student dashboard loads chapters correctly
- [ ] Each section shows reading content with embedded textbook images
- [ ] AI deep-dive buttons work on concept blocks
- [ ] Gate quizzes work and remediation generates on failure
- [ ] Free-text prompts evaluate with AI feedback
- [ ] Assignment workspace loads with AI coaching and "Draft with AI" chat
- [ ] Business plan/capstone page shows all assignment sections, preview mode, and portfolio submission
- [ ] Certificate unlocks after all sections + assignments + portfolio are complete
- [ ] Instructor dashboard shows student roster, class management, announcements, and chapter analytics
- [ ] Instructor gradebook displays scores and supports CSV export
- [ ] Students can join a class via join code
- [ ] Announcements flow from instructor to students with read receipts
- [ ] Dark mode works across all pages
- [ ] Attribution footer appears at the bottom of every page with correct textbook/license info
- [ ] Free-text "What we're looking for" rubric panel is visible and shows student-friendly criteria
- [ ] Assignment "What We Look For" button shows the rubric for each section
- [ ] Microphone tooltip appears on first visit to a writing prompt
- [ ] Ask Question panel closes on Escape key and traps Tab focus
- [ ] TTS Space key toggles play/pause; active sentence has underline highlight
- [ ] Instructor dashboard shows "At Risk" flags for struggling students
- [ ] Instructor dashboard shows "Content Insights" section with remediation hotspots
- [ ] Student dashboard shows 3 hero stats, grade projection, and activity heatmap
- [ ] Certificate has Download PDF button, verification code, and LinkedIn share
- [ ] All free-text prompts use `minWords: 75` (not 100 or 150)
- [ ] `scripts/validate-content.ts` passes with 0 errors
- [ ] Course outline appears on Course Dashboard detail page

## Content Quality Checklist

When generating content, verify:
- [ ] Every quiz question tests concepts from its OWN section (not other sections)
- [ ] Each quiz has exactly 1 correct answer per question
- [ ] Section content is 800-1200 words with 3-5 content blocks
- [ ] Key terms have clear, concise definitions
- [ ] Free-text prompts require application (not just recall)
- [ ] **Free-text `minWords` is 75** (not 100 or 150) — standard across ALL courses
- [ ] Free-text `rubric` is written in student-friendly language (shown to students before writing)
- [ ] Content uses **bold** for vocabulary terms
- [ ] Content uses proper markdown: `>` for blockquotes, `**` for bold, numbered/bullet lists
- [ ] Bloom's taxonomy progression: early sections = remember/understand, later = apply/analyze
- [ ] Embedded images have contextual captions with page numbers
- [ ] Assignment sections use `minWords: 75` (not 100 or 150)
- [ ] Assignment sections have a `rubric` field (shown to students via "What We Look For" button)
- [ ] Assignment `relatedChapters` array is set correctly (used for AI cross-references in feedback)
- [ ] `course.config.ts` has thresholds, features, and attribution sections populated

## Image Support

The template supports two types of image embedding:

### 1. Image content blocks (structured)
Used by `curate-images.py` to embed extracted textbook images:
```json
{
  "type": "image",
  "title": "Caption text",
  "body": "",
  "imageSrc": "/images/ch01/fig-ch01-03.png",
  "imageAlt": "Descriptive alt text",
  "imageCaption": "Caption with page reference (p. 42)"
}
```

Rendered by `ContentRenderer.tsx` as `<figure>` elements with lazy loading and captions.

### 2. Markdown image syntax (inline)
Supported in content block body text:
```
![Alt text](/images/ch01/fig-ch01-03.png)
```

Rendered by `renderMarkdown.tsx` as `<figure>` with `<figcaption>`.

### ContentBlock type definition
```typescript
export interface ContentBlock {
  type: 'concept' | 'example' | 'summary' | 'image';
  title?: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
}
```

## SSO Authentication (Course Dashboard)

All authentication is managed centrally by the Course Dashboard. Course apps do NOT have their own signup/login — they receive users via SSO.

### How it works
1. User signs up and enrolls on the Course Dashboard (e.g. `courses.esdesigns.org`)
2. User clicks "Go to Course" → Dashboard verifies enrollment (scoped to tenant), determines effective role (highest of global role vs tenant membership role), signs a 60-second HS256 JWT
3. Course app receives JWT at `/auth/sso?token=<jwt>`
4. Course app verifies JWT signature with shared `DASHBOARD_SSO_SECRET`
5. Course app generates a magic link OTP via `admin.generateLink({ type: 'magiclink' })`, then calls `verifyOtp()` on a cookie-backed Supabase client to establish the session
6. **Course app upserts the profile** with role and name from the SSO payload (admin/super_admin → instructor, student → student)
7. User is redirected to `/chapters` (student) or `/instructor` (instructor/admin)

### Role mapping
| Dashboard role | Course app role |
|---------------|----------------|
| `student` | `student` |
| `instructor` | `instructor` |
| `admin` | `instructor` |
| `super_admin` | `instructor` |

The dashboard computes an **effective role** by comparing the user's global profile role with their tenant membership role, using whichever is higher in the hierarchy: `student < instructor < admin < super_admin`.

### SSO payload (JWT claims)
```typescript
interface SSOPayload {
  sub: string;        // dashboard user ID
  email: string;
  full_name: string;
  role: string;       // effective role
  course_id: string;
  tenant_id?: string;   // multi-tenant context
  tenant_slug?: string;
}
```

### Key SSO files
| File | Purpose |
|------|---------|
| `src/lib/sso.ts` | `verifySSOToken()`, `DASHBOARD_URL`, `COURSE_SLUG` constants |
| `src/app/auth/sso/route.ts` | SSO endpoint — verifies JWT, creates/updates user, **upserts profile with role**, generates magic link, verifies OTP, sets session cookies, redirects |
| `src/lib/supabase/admin.ts` | Admin client (`SUPABASE_SERVICE_ROLE_KEY`) for user creation and magic link generation |
| `src/lib/supabase/middleware.ts` | Redirects unauthenticated users to `DASHBOARD_URL/courses/COURSE_SLUG`; enforces role-based routing (students vs instructors) |
| `src/app/login/page.tsx` | Redirects to dashboard (no local login form) |
| `src/app/signup/page.tsx` | Redirects to dashboard (no local signup form) |
| `src/app/forgot-password/page.tsx` | Redirects to `DASHBOARD_URL/forgot-password` |
| `src/app/reset-password/page.tsx` | Redirects to `DASHBOARD_URL/reset-password` |
| `src/app/auth/callback/route.ts` | OAuth code exchange (available for future OAuth providers) |

### Bookmarkable URLs
- Direct visits to the course URL by unauthenticated users redirect to the dashboard course page
- The dashboard provides `/go/<slug>` as a shareable, bookmarkable launch URL that checks enrollment and performs SSO
- Authenticated users visiting `/` are redirected to `/chapters` or `/instructor` based on role

### Middleware behavior
1. Refreshes Supabase session on every request (critical for Server Components)
2. Public routes: `/`, `/auth/*` — no auth required
3. Unauthenticated users on any other route → redirect to `DASHBOARD_URL/courses/COURSE_SLUG`
4. Authenticated users on `/` → redirect to `/chapters` (student) or `/instructor` (instructor)
5. Role enforcement: instructors cannot access `/chapters` or `/chapter/*`; students cannot access `/instructor/*`

## Assignment & Capstone System

### Assignment flow
1. Students navigate to `/assignment/[assignmentId]` from the chapter dashboard
2. Each assignment has multiple sections with word count requirements and rubrics
3. Students write in a textarea with live word count tracking
4. **"Draft with AI"** opens a slide-over chat panel (`DraftChat.tsx`):
   - Phase 1: AI asks 2-3 focused questions about the student's topic
   - Phase 2: AI generates a complete draft wrapped in `--- DRAFT ---` markers
   - Phase 3: Student can refine the draft through conversation
   - "Use This Draft" button inserts content into the textarea
5. **"Submit for AI Coaching"** sends content to `/api/assignment/evaluate`:
   - Validates word count (minimum 50% of `minWords`)
   - Claude scores 0-100 with structured feedback: `{ score, feedback, strengths, improvements }`
   - Saves draft to `assignment_drafts` table with `ai_feedback` JSON
6. Students can revise and resubmit (new `draft_number` each time)
7. **Score trajectory** shown in feedback: "Draft 1: 65% → Draft 2: 74% → Draft 3: 82%" with improvement badge
8. **"Ask about this feedback"** button opens DraftChat pre-loaded with the evaluation context
9. **"What We Look For"** button shows the section rubric before writing
10. Section status: green checkmark (>=80%), yellow/orange (<80%), blue (content exists, not submitted), gray (not started)

### Capstone / Portfolio flow
1. Portfolio card appears on student dashboard once at least one assignment section is submitted
2. `/business-plan` page (`BusinessPlanWorkspace.tsx`) has two modes:
   - **Edit mode**: Shows all assignment parts as expandable accordion cards with completed sections and scores. Two additional fields: Executive Summary and Introduction (both required for preview)
   - **Preview/Print mode**: Professional document layout with cover page, table of contents, all assignment parts, serif fonts, print-to-PDF styling
3. **"Draft with AI"** for Executive Summary and Introduction (`BPDraftChat.tsx`):
   - Executive Summary: AI sees the full plan content and synthesizes a 200-500 word summary
   - Introduction: AI asks reflective questions about inspiration, learning journey, personal growth
4. **"Submit Portfolio"** saves a `portfolio-submitted` flag to `assignment_drafts` (assignment_id = 0)

### Certificate requirements
All of the following must be complete:
1. All sections read (`section_progress.status = 'completed'`)
2. All assignments submitted (at least 1 section per assignment 1-N with `ai_feedback`)
3. Portfolio submitted (`assignment_drafts` with `assignment_id = 0`, `section_key = 'portfolio-submitted'`)

Certificate displays: student name, course title, letter grade (A-F) + percentage, completion date. Styled for print-to-PDF.

## Instructor Dashboard Features

### Class management (`ClassManager.tsx`)
- Instructors create classes with auto-generated join codes
- Students join via join code from the student dashboard (`JoinClass.tsx`)
- Tables: `classes`, `class_enrollments`

### Student roster (`StudentRoster.tsx`)
- View all enrolled students, filterable by class
- **At Risk flags**: Students with mastery <70%, inactive 7+ days, or 3+ remediation attempts are flagged with "AT RISK" badges and a red alert banner
- Click through to individual student detail view (`/instructor/student/[studentId]`)
- Detail view shows: section progress, quiz attempts, free-text responses, assignment drafts with AI feedback

### Announcements (`AnnouncementPanel.tsx`)
- Instructors post class-wide or individual announcements
- Students see announcements on their dashboard (`Announcements.tsx`)
- Read receipts tracked in `announcement_reads` table
- Types: `'class'` (broadcast) or `'individual'` (direct message)

### Gradebook (`GradebookTable.tsx`)
- View assignment scores for all students
- Export grades as CSV via `/api/instructor/export`

### Content Insights (instructor dashboard)
- Shows most-struggled sections ranked by average remediation attempts
- Helps instructors identify content that needs rewriting or supplemental material

### Student feedback (`FeedbackFilter.tsx`)
- View satisfaction survey responses from students
- **Satisfaction by Course Stage** trend chart showing average rating at each trigger point with change indicators
- Stored in `student_feedback` table with rating (1-5) and optional comment

### Activity tracking
- `activity_log` table records student actions with `activity_type` and `details` JSON
- `ActivityTimeline.tsx` on student dashboard shows recent activity
- `MilestoneBanner.tsx` celebrates student achievements

## Database Schema (Supabase)

### Tables
| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users` — `full_name`, `email`, `role` (student/instructor) |
| `section_progress` | Per-section mastery tracking — `status`, `mastery_score`, `remediation_count` |
| `quiz_attempts` | Gate quiz results — `answers` JSON, `score`, `passed` |
| `free_text_responses` | Free-text evaluations — `response_text`, `ai_evaluation` JSON |
| `assignment_drafts` | Assignment drafts with AI feedback — `content`, `ai_feedback` JSON, `draft_number` |
| `ai_interactions` | Audit log of all Claude API calls |
| `discussion_posts` | Chapter-based discussion posts (threaded via `parent_id`) |
| `classes` | Instructor-created classes with `join_code` |
| `class_enrollments` | Student-class enrollment mapping |
| `announcements` | Instructor messages — `class_id` for broadcast, `recipient_id` for individual |
| `announcement_reads` | Read receipt tracking |
| `activity_log` | Student activity audit trail — `activity_type`, `details` JSON |
| `student_feedback` | Satisfaction surveys — `trigger_point`, `rating` (1-5), `comment` |

### Key functions
- `handle_new_user()` — trigger on `auth.users` insert, creates `profiles` row from user metadata
- `is_instructor()` — `SECURITY DEFINER` function that checks role without RLS recursion
- `check_announcement_access()` — determines if a student can see an announcement

### RLS pattern
- Students: can read/insert/update their own data
- Instructors: can read all student data via `is_instructor()` SECURITY DEFINER function (avoids RLS recursion)
- Classes: instructors manage their own; students can view enrolled classes and self-enroll

## Course Dashboard Integration

The Course Dashboard (`github.com/Brooksw453/Course-Dashboard`) is the central hub for browsing, purchasing, and launching courses.

### Multi-tenant architecture
The dashboard supports multiple schools/organizations (tenants). Each tenant has:
- Custom branding (colors, logo, hero text, footer)
- Domain matching (resolved via `tenants.domains` array or `TENANT_SLUG` env var)
- Per-tenant course catalog (`tenant_courses` table with optional custom pricing)
- Per-tenant user roles (`tenant_memberships` table — student/instructor/admin per school)
- Tenant-scoped enrollments and payments

### Dashboard SSO launch flow
1. User clicks "Go to Course" on dashboard
2. `GET /api/courses/[courseId]/launch` verifies enrollment (scoped to current tenant)
3. Computes effective role: max(global profile role, tenant membership role)
4. Signs 60-second JWT with `{ sub, email, full_name, role, course_id, tenant_id, tenant_slug }`
5. Redirects to `course-app-url/auth/sso?token=<jwt>`

### Dashboard course registration SQL
The `courses` table has these key columns:
```
slug, title, subtitle, description, short_description, image_url,
instructor_name, module_count, estimated_hours, price_cents,
stripe_price_id, app_url, is_published, sort_order, tags, course_type,
course_outline (JSONB)
```

The `course_outline` column stores the chapter/section list as JSONB:
```json
[
  {"title": "Chapter 1: Title", "items": ["1.1 Section", "1.2 Section"]},
  {"title": "Chapter 2: Title", "items": ["2.1 Section", "2.2 Section"]}
]
```

### Stripe payment flow (paid courses)
1. User clicks "Purchase" → redirects to Stripe Checkout
2. Stripe webhook creates enrollment + payment records
3. User returns and sees "Go to Course" button

### Dashboard roles
| Role | Scope | Capabilities |
|------|-------|-------------|
| `student` | Per-tenant | Browse courses, enroll, launch courses |
| `instructor` | Per-tenant | All student capabilities + mapped to instructor in course apps |
| `admin` | Per-tenant | All instructor capabilities + manage tenant courses/users |
| `super_admin` | Global | All admin capabilities across all tenants |

## Speech-to-Text & Text-to-Speech (Accessibility)

Both features use the browser-native **Web Speech API** — zero cost, no npm dependencies, no backend changes. They are hidden automatically on unsupported browsers.

### Speech-to-Text (STT) — Microphone Button

Allows students to dictate written responses instead of typing, especially helpful on mobile.

**How it works:**
- `MicrophoneButton` component rendered inside textarea containers (top-right, absolute positioned)
- Uses `useSpeechToText` hook wrapping `SpeechRecognition` / `webkitSpeechRecognition`
- Transcribed text appends to existing textarea content; word count updates reactively
- Auto-restarts on Chrome silence timeout; handles permission errors gracefully
- Integrated into `FreeTextPrompt.tsx` (section written responses) and `AssignmentWorkspace.tsx` (assignment sections)

**Browser support:** Chrome (desktop + Android), Safari (iOS 14.5+), Edge. Not supported on Firefox (<3% mobile share) — button hidden.

### Text-to-Speech (TTS) — Listen Button

Allows students to listen to section content read aloud with sentence-level highlighting.

**How it works:**
- "Listen" button appears in the content step of `SectionLearningFlow.tsx`
- `TTSController` component renders a fixed-bottom audio player bar with play/pause, skip, speed, and close controls
- `useTextToSpeech` hook splits content into ~200-char sentence chunks (avoids iOS 15-sec cutoff bug)
- Reads blocks sequentially: title → learning objectives → content blocks → key terms
- `ContentRenderer` switches to sentence-highlighted plain text view for the active block
- Active sentence gets light blue highlight; already-read sentences are dimmed; auto-scrolls into view
- Uses same `chunkText()` splitting as TTS engine so highlighting stays perfectly in sync

**Speed control (mobile-optimized):**
- Mobile browsers scale `SpeechSynthesis.rate` much more aggressively than desktop
- Desktop rates: 0.75, 1.0, 1.25, 1.5, 2.0 (actual values)
- Mobile rates: 0.85, 1.0, 1.05, 1.1, 1.15 (compressed — same user-facing labels)
- Rate changes cancel current utterance and restart at new rate immediately

**Auto-pause behavior:**
- TTS automatically stops when transitioning from content to knowledge checks, written responses, or assignments
- Pauses when the browser tab is hidden (via `visibilitychange` event)

**Key files:**
| File | Purpose |
|------|---------|
| `src/hooks/useSpeechToText.ts` | STT hook — browser detection, start/stop, interim results, error handling |
| `src/hooks/useTextToSpeech.ts` | TTS hook — sentence chunking, block/chunk tracking, speed control, auto-pause |
| `src/lib/stripMarkdown.ts` | Strips `**bold**`, headings, lists, blockquotes → plain text for speech |
| `src/components/MicrophoneButton.tsx` | Mic button — idle/recording/error states, 44px touch target |
| `src/components/TTSController.tsx` | Audio player bar — constructs reading queue from `SectionContent`, controls |
| `src/components/ContentRenderer.tsx` | Renders sentence-highlighted text when TTS is active for a block |
| `src/components/FreeTextPrompt.tsx` | Written response textarea — mic button integrated |
| `src/app/assignment/[assignmentId]/AssignmentWorkspace.tsx` | Assignment textarea — mic button integrated |
| `src/app/chapter/[chapterId]/[sectionId]/SectionLearningFlow.tsx` | Orchestrates TTS state, passes block/chunk indices to ContentRenderer |

## Architecture Notes

- **Content is fully dynamic** — `content.ts` discovers chapters by reading the filesystem. No hardcoded chapter count anywhere.
- **Database schema is generic** — uses `chapter_id` (int) and `section_id` (text). Works for any number of chapters/sections.
- **All AI prompts use `courseConfig.aiTutor.role`** — changing the config changes the AI's personality across all endpoints.
- **Capstone page is conditional** — set `courseConfig.capstone.enabled: false` to hide it. The `/business-plan` route checks this.
- **Theme (dark/light mode)** is fully implemented with localStorage persistence and system preference detection.
- **Auth is centralized** — no local signup/login; all auth flows through the Course Dashboard via SSO using magic link OTP session establishment.
- **SSO upserts profile** — the `/auth/sso` route updates `profiles.role` on every login, ensuring instructor access works immediately.
- **Rate limiting** — AI endpoints use an in-memory rate limiter (15 requests/minute per user) to prevent abuse.
- **Assignment drafts use assignment_id = 0** for portfolio-level content (executive summary, introduction, submission flag).
- **Assignment minWords default is 75** — lower threshold reduces friction while still requiring meaningful responses.
- **Instructor role enforcement** — middleware prevents instructors from accessing student pages and vice versa.
- **Multi-tenant aware** — SSO payload includes `tenant_id` and `tenant_slug` from the dashboard (prepared for future per-tenant features in course apps).
- **Shared Supabase** — all course apps share one Supabase instance via the Course Dashboard. No per-course Supabase projects needed. Migrations will error on shared instances (tables already exist) — this is expected.
- **Image pipeline** — PyMuPDF extracts images from PDF → curate-images.py selects best per section → update-captions.py adds contextual captions. Images served from `public/images/`.
- **Speech-to-text** — browser-native Web Speech API, zero cost. `MicrophoneButton` component in `FreeTextPrompt` and `AssignmentWorkspace`. Hidden on unsupported browsers (Firefox).
- **Text-to-speech** — browser-native Web Speech API, zero cost. `TTSController` with sentence-level highlighting in `ContentRenderer`. Mobile-optimized speed rates. Auto-pauses at knowledge checks and written responses. Space key toggles play/pause. Active sentence uses underline + background for colorblind accessibility.
- **Centralized thresholds** — all pass/fail thresholds and grade boundaries live in `courseConfig.thresholds`. Never hardcode 70, 80, 90 etc. — always reference config.
- **Shared score utilities** — `scoreUtils.ts` provides `getLetterGrade()`, `getScoreColor()`, `getGradeColor()`, `getGradeBg()`. Import from `@/lib/scoreUtils` instead of defining locally.
- **Attribution** — `Attribution.tsx` footer on every page via `layout.tsx`. Reads from `courseConfig.attribution`. Required for CC BY 4.0 compliance on OpenStax content.
- **AI cross-references** — AI feedback (free-text eval, assignment eval) includes "Review Section X.Y" suggestions. Remediation includes student's wrong answer for misconception-targeted explanations.
- **Focus trap** — `AskQuestionPanel` traps Tab key within the panel, closes on Escape, returns focus on close. Required for WCAG 2.1 AA.
- **At Risk detection** — Instructor dashboard flags students with mastery <70%, 7+ days inactive, or 3+ remediation attempts.
- **Daily streaks** — Student dashboard tracks consecutive days with section completions (not consecutive sections). Activity heatmap shows last 12 weeks.
- **Grade projection** — Dashboard shows projected final grade based on weighted formula (40% mastery + 30% quiz + 30% assignment).
- **MicrophoneButton tooltip** — First-visit tooltip auto-dismisses after 6 seconds, stored in localStorage. Textarea placeholders include "or tap the mic to speak."
- **Free-text minWords standard** — All courses use `minWords: 75` for free-text prompts and assignment sections. This is the enforced standard — do not use 100 or 150.
- **Evaluation rubric visibility** — Free-text `rubric` is shown to students via collapsible "What we're looking for" panel. Assignment `rubric` is shown via "What We Look For" button. Write rubrics in student-friendly language.

## Replicating Template Changes Across Courses

When making improvements to the template code (anything in `src/` except `course.config.ts`), use the replication script to push changes to all 9 other courses:

```bash
bash scripts/replicate-template.sh --dry-run   # preview first
bash scripts/replicate-template.sh              # copy files
```

This copies all shared template files but **preserves each course's `course.config.ts` and `content/`**. After copying, you must manually update each course's config if new config fields were added (see `scripts/CONFIG-TEMPLATE.md`).

**Files that are course-specific (never auto-copied):**
- `src/lib/course.config.ts` — title, textbook, AI tutor, attribution
- `content/chapters/` — all chapter content JSON
- `content/assignments/` — all assignment JSON
- `public/images/` — extracted textbook images
- `.env.local` — environment variables
