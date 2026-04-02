@AGENTS.md

# Adaptive Learning Course Template

This repo is a fully-featured AI-powered adaptive learning platform. It can be used as-is for Introduction to Business, or duplicated and reconfigured for any course by following this guide.

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind CSS 4) deployed on **Vercel**
- **Supabase** for PostgreSQL database + Auth (SSO via Course Dashboard, Row Level Security)
- **Claude API** (Sonnet) for AI tutoring, quiz remediation, free-text evaluation, assignment coaching, and capstone drafting
- **jose** for JWT signing/verification (SSO)
- **Content** stored as static JSON in `content/chapters/` and `content/assignments/`

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/course.config.ts` | **Single source of truth** for course title, subtitle, AI tutor role, capstone config |
| `src/lib/content.ts` | Loads chapter/section/quiz/assignment JSON from filesystem — fully dynamic |
| `src/lib/types.ts` | TypeScript interfaces for all content JSON and database types |
| `src/lib/claude.ts` | Claude API client initialization |
| `src/lib/rateLimit.ts` | In-memory rate limiter for AI endpoints (15 req/min) |
| `src/lib/sso.ts` | JWT verification, dashboard URL, course slug constants |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client (cookie-based) |
| `src/lib/supabase/admin.ts` | Admin client using service role key (for SSO user creation) |
| `src/lib/supabase/middleware.ts` | Auth middleware — redirects unauthenticated users to dashboard, enforces role-based routing |
| `content/chapters/chNN/` | Chapter content: `meta.json`, `sections/`, `quizzes/`, `discussion.json` |
| `content/assignments/` | Assignment definition JSON files |
| `scripts/validate-content.ts` | Validates all content JSON matches expected interfaces |
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
| `/auth/sso` | SSO endpoint — receives JWT from dashboard, creates session |
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
# Clone or copy this repo into a new folder
cp -r adaptive-learning/ ../new-course-name/
cd ../new-course-name/
rm -rf .git .vercel .next node_modules
git init
npm install
```

### Step 2: Analyze the Textbook

Read the textbook PDF placed in the project root. Identify:
- Total number of chapters
- Section titles within each chapter (e.g., "3.1 Global Trade", "3.2 Barriers to Trade")
- Key concepts, terms, and learning objectives per section

### Step 3: Update `src/lib/course.config.ts`

```typescript
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
};
```

### Step 4: Delete Existing Content

```bash
rm -rf content/chapters/*
rm -rf content/assignments/*
```

### Step 5: Generate Chapter Content

For each chapter, create the following files. Use the textbook PDF as the source material.

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
    "prompt": "Application-focused question that requires students to connect concepts to real situations. Should require 100+ words to answer well.",
    "minWords": 75,
    "rubric": "What a good answer should include. Be specific about which concepts must be addressed."
  }
}
```

**Content Guidelines:**
- 3-5 content blocks per section (mix of concept, example, summary)
- 800-1200 words total across all blocks
- 3-8 key terms per section with clear definitions
- Use **bold** for vocabulary terms on first mention
- Free-text prompts should be application-focused, not recall

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

### Step 6: Generate Assignments (Optional)

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
      "minWords": 150,
      "maxWords": 400,
      "rubric": "What a good answer includes.",
      "tips": ["Tip 1", "Tip 2"]
    }
  ]
}
```

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

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run all migration files from `supabase/migrations/` in order:
   - `001_initial_schema.sql` — profiles, section_progress, quiz_attempts, free_text_responses, assignment_drafts, ai_interactions, discussion_posts + RLS
   - `002_instructor_access.sql` — initial instructor read policies (superseded by 003)
   - `003_fix_recursive_policies.sql` — creates `is_instructor()` SECURITY DEFINER function, recreates all instructor policies to avoid RLS recursion
   - `004_class_enrollment.sql` — `classes` and `class_enrollments` tables with join codes
   - `005_announcements.sql` — `announcements` table (class broadcast + individual messages)
   - `006_read_receipts_and_activity.sql` — `announcement_reads` and `activity_log` tables
   - `007_student_feedback.sql` — `student_feedback` table (satisfaction surveys)
3. Go to **Auth Settings** → enable Email/Password sign-in
4. Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-claude-api-key
DASHBOARD_SSO_SECRET=your-shared-sso-secret
DASHBOARD_URL=https://courses.esdesigns.org
COURSE_SLUG=your-course-slug
```

5. Instructor accounts are created automatically via SSO. Dashboard users with role `admin` or `super_admin` are mapped to `instructor` in the course app. You can also manually promote a user:
```sql
UPDATE profiles SET role = 'instructor' WHERE email = 'instructor@example.com';
```

### Step 10: Deploy to Vercel

```bash
# Push to GitHub first
git add -A
git commit -m "Initial course setup"
git remote add origin https://github.com/your-username/your-course-repo.git
git push -u origin main

# Deploy
npx vercel --prod
```

Set environment variables in the Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — needed for SSO user creation
- `ANTHROPIC_API_KEY`
- `DASHBOARD_SSO_SECRET` — must match the Course Dashboard's secret
- `DASHBOARD_URL` — e.g. `https://courses.esdesigns.org`
- `COURSE_SLUG` — this course's slug on the dashboard (e.g. `introduction-to-business`)

Optionally add a custom domain in Vercel → Project Settings → Domains.

### Step 11: Register the Course on the Course Dashboard

1. In the Course Dashboard's Supabase, add a row to the `courses` table with:
   - `slug` — URL-friendly identifier (e.g. `introduction-to-business`)
   - `title`, `subtitle`, `description`, `short_description`
   - `app_url` — the Vercel URL of the deployed course app (e.g. `https://intro-to-business.vercel.app`)
   - `price_cents` — set to `0` for free courses, or a Stripe amount for paid courses
   - `stripe_price_id` — required for paid courses
   - `is_published: true`
2. Add the course to the appropriate tenant(s) in the `tenant_courses` table
3. The dashboard's `/go/<slug>` route provides a bookmarkable launch URL for students

### Step 12: Final Verification

- [ ] Landing page shows correct course title
- [ ] Unauthenticated users are redirected to the Course Dashboard (not a local login page)
- [ ] SSO login from dashboard creates user and redirects to `/chapters` (student) or `/instructor` (instructor)
- [ ] Student dashboard loads chapters correctly
- [ ] Each section shows reading content with AI deep-dive buttons
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
- [ ] `scripts/validate-content.ts` passes with 0 errors

## Content Quality Checklist

When generating content, verify:
- [ ] Every quiz question tests concepts from its OWN section (not other sections)
- [ ] Each quiz has exactly 1 correct answer per question
- [ ] Section content is 800-1200 words with 3-5 content blocks
- [ ] Key terms have clear, concise definitions
- [ ] Free-text prompts require application (not just recall)
- [ ] Content uses **bold** for vocabulary terms
- [ ] Content uses proper markdown: `>` for blockquotes, `**` for bold, numbered/bullet lists
- [ ] Bloom's taxonomy progression: early sections = remember/understand, later = apply/analyze

## SSO Authentication (Course Dashboard)

All authentication is managed centrally by the Course Dashboard. Course apps do NOT have their own signup/login — they receive users via SSO.

### How it works
1. User signs up and enrolls on the Course Dashboard (e.g. `courses.esdesigns.org`)
2. User clicks "Go to Course" → Dashboard verifies enrollment (scoped to tenant), determines effective role (highest of global role vs tenant membership role), signs a 60-second HS256 JWT
3. Course app receives JWT at `/auth/sso?token=<jwt>`
4. Course app verifies JWT signature with shared `DASHBOARD_SSO_SECRET`
5. Course app finds or creates a local Supabase user via admin client:
   - Existing user: updates profile (name, role)
   - New user: creates auth user with random password + `email_confirm: true`
6. Course app generates a magic link OTP via `admin.generateLink({ type: 'magiclink' })`, then calls `verifyOtp()` on a cookie-backed Supabase client to establish the session
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
| `src/app/auth/sso/route.ts` | SSO endpoint — verifies JWT, creates/updates user, generates magic link, verifies OTP, sets session cookies, redirects |
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

### Adding SSO to a new course
1. Install `jose`: `npm install jose`
2. Copy these files from this repo:
   - `src/lib/sso.ts`
   - `src/app/auth/sso/route.ts`
   - `src/lib/supabase/admin.ts`
   - `src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`
3. Update `src/lib/supabase/middleware.ts` to redirect unauthenticated users to `DASHBOARD_URL/courses/COURSE_SLUG` and enforce role-based routing
4. Add env vars: `DASHBOARD_SSO_SECRET`, `DASHBOARD_URL`, `COURSE_SLUG`, `SUPABASE_SERVICE_ROLE_KEY`
5. Add the course to the dashboard's `courses` table with the correct `app_url`
6. Add the course to the appropriate tenant(s) in `tenant_courses`

## Assignment & Capstone System

### Assignment flow
1. Students navigate to `/assignment/[assignmentId]` from the chapter dashboard
2. Each assignment has multiple sections with word count requirements and rubrics
3. Students write in a textarea with live word count tracking
4. **"Draft with AI"** opens a slide-over chat panel (`DraftChat.tsx`):
   - Phase 1: AI asks 2-3 focused questions about the student's business idea
   - Phase 2: AI generates a complete draft wrapped in `--- DRAFT ---` markers
   - Phase 3: Student can refine the draft through conversation
   - "Use This Draft" button inserts content into the textarea
5. **"Submit for AI Coaching"** sends content to `/api/assignment/evaluate`:
   - Validates word count (minimum 50% of `minWords`)
   - Claude scores 0-100 with structured feedback: `{ score, feedback, strengths, improvements }`
   - Saves draft to `assignment_drafts` table with `ai_feedback` JSON
6. Students can revise and resubmit (new `draft_number` each time)
7. Section status: green checkmark (>=80%), yellow/orange (<80%), blue (content exists, not submitted), gray (not started)

### Capstone / Business Plan flow
1. Business Plan card appears on student dashboard once at least one assignment section is submitted
2. `/business-plan` page (`BusinessPlanWorkspace.tsx`) has two modes:
   - **Edit mode**: Shows all 4 assignment parts as expandable accordion cards with completed sections and scores. Two additional fields: Executive Summary and Introduction (both required for preview)
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

### Student feedback (`FeedbackFilter.tsx`)
- View satisfaction survey responses from students
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

### Bookmarkable launch
`GET /go/<slug>` — checks auth, checks enrollment, performs SSO launch. Unauthenticated or unenrolled users are redirected to the course detail page.

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

## Architecture Notes

- **Content is fully dynamic** — `content.ts` discovers chapters by reading the filesystem. No hardcoded chapter count anywhere.
- **Database schema is generic** — uses `chapter_id` (int) and `section_id` (text). Works for any number of chapters/sections.
- **All AI prompts use `courseConfig.aiTutor.role`** — changing the config changes the AI's personality across all endpoints.
- **Capstone page is conditional** — set `courseConfig.capstone.enabled: false` to hide it. The `/business-plan` route checks this.
- **Theme (dark/light mode)** is fully implemented with localStorage persistence and system preference detection.
- **Auth is centralized** — no local signup/login; all auth flows through the Course Dashboard via SSO using magic link OTP session establishment.
- **Rate limiting** — AI endpoints use an in-memory rate limiter (15 requests/minute per user) to prevent abuse.
- **Assignment drafts use assignment_id = 0** for portfolio-level content (executive summary, introduction, submission flag).
- **Instructor role enforcement** — middleware prevents instructors from accessing student pages and vice versa.
- **Multi-tenant aware** — SSO payload includes `tenant_id` and `tenant_slug` from the dashboard (prepared for future per-tenant features in course apps).
