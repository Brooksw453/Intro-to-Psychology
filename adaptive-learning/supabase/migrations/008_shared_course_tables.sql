-- ============================================================
-- Shared Course Tables Migration
-- ============================================================
-- Run this in the DASHBOARD Supabase SQL Editor (not per-course).
-- Adds all course-app tables with course_id scoping so multiple
-- course apps can share a single Supabase project.
--
-- Prerequisites: Dashboard migrations 001-007 already applied
-- (profiles, courses, tenants, etc. already exist).
-- ============================================================

-- ============================================================
-- 0. Update is_instructor() to accept Dashboard roles
-- ============================================================
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('instructor', 'admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 1. Section Progress (tracks student mastery per section)
-- ============================================================
CREATE TABLE IF NOT EXISTS section_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  section_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'needs_remediation', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  mastery_score NUMERIC(5,2),
  remediation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id, chapter_id, section_id)
);

CREATE INDEX IF NOT EXISTS idx_section_progress_course
  ON section_progress(course_id, user_id);

-- ============================================================
-- 2. Quiz Attempts (gate check results)
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  section_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  answers JSONB NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_course_user_section
  ON quiz_attempts(course_id, user_id, chapter_id, section_id);

-- ============================================================
-- 3. Free-Text Responses (evaluated by Claude)
-- ============================================================
CREATE TABLE IF NOT EXISTS free_text_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  section_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  response_text TEXT NOT NULL,
  ai_evaluation JSONB,
  ai_model TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_free_text_course_user_section
  ON free_text_responses(course_id, user_id, chapter_id, section_id);

-- ============================================================
-- 4. Assignment Drafts (AI coaching history)
-- ============================================================
CREATE TABLE IF NOT EXISTS assignment_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  assignment_id INTEGER NOT NULL,
  section_key TEXT NOT NULL,
  draft_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  ai_feedback JSONB,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignment_drafts_course_user
  ON assignment_drafts(course_id, user_id, assignment_id);

-- ============================================================
-- 5. AI Interactions Log (auditing and cost tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL
    CHECK (interaction_type IN ('quiz_remediation', 'free_text_eval', 'assignment_coaching', 'content_generation')),
  context JSONB NOT NULL,
  prompt_sent TEXT NOT NULL,
  response_received TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_course_user
  ON ai_interactions(course_id, user_id);

-- ============================================================
-- 6. Discussion Posts
-- ============================================================
CREATE TABLE IF NOT EXISTS discussion_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  parent_id UUID REFERENCES discussion_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_quality_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discussion_posts_course_chapter
  ON discussion_posts(course_id, chapter_id, created_at);

-- ============================================================
-- 7. Classes (instructor-created groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) NOT NULL,
  course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classes_course
  ON classes(course_id, instructor_id);

-- ============================================================
-- 8. Class Enrollments (no course_id — FK to classes)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- ============================================================
-- 9. Announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id) NOT NULL,
  course_id TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'class',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_course
  ON announcements(course_id, created_at DESC);

-- ============================================================
-- 10. Announcement Reads (no course_id — FK to announcements)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user ON announcement_reads(user_id);

-- ============================================================
-- 11. Activity Log
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  course_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_course_user
  ON activity_log(course_id, user_id, created_at DESC);

-- ============================================================
-- 12. Student Feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS student_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  course_id TEXT NOT NULL,
  trigger_point TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_text_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- Section Progress
CREATE POLICY "Users can read own progress" ON section_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON section_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON section_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Instructors can read all progress" ON section_progress
  FOR SELECT USING (is_instructor());

-- Quiz Attempts
CREATE POLICY "Users can read own quiz attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can read all quiz attempts" ON quiz_attempts
  FOR SELECT USING (is_instructor());

-- Free-Text Responses
CREATE POLICY "Users can read own free text" ON free_text_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own free text" ON free_text_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can read all free text" ON free_text_responses
  FOR SELECT USING (is_instructor());

-- Assignment Drafts
CREATE POLICY "Users can read own drafts" ON assignment_drafts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drafts" ON assignment_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can read all drafts" ON assignment_drafts
  FOR SELECT USING (is_instructor());

-- AI Interactions
CREATE POLICY "Users can read own ai interactions" ON ai_interactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai interactions" ON ai_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Instructors can read all ai interactions" ON ai_interactions
  FOR SELECT USING (is_instructor());

-- Discussion Posts (all authenticated users can read)
CREATE POLICY "Anyone can read discussion posts" ON discussion_posts
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON discussion_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON discussion_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Classes
CREATE POLICY "Instructors can manage own classes" ON classes
  FOR ALL USING (instructor_id = auth.uid());
CREATE POLICY "Students can view classes they are enrolled in" ON classes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM class_enrollments WHERE class_id = id AND student_id = auth.uid())
  );

-- Class Enrollments
CREATE POLICY "Instructors can view enrollments for own classes" ON class_enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE id = class_id AND instructor_id = auth.uid())
  );
CREATE POLICY "Students can view own enrollments" ON class_enrollments
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can enroll themselves" ON class_enrollments
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Announcements
CREATE POLICY "Instructors can manage own announcements" ON announcements
  FOR ALL USING (instructor_id = auth.uid());

CREATE OR REPLACE FUNCTION check_announcement_access(ann_class_id UUID, ann_recipient_id UUID, ann_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN ann_type = 'individual' AND ann_recipient_id = auth.uid() THEN true
    WHEN ann_type = 'class' AND EXISTS (
      SELECT 1 FROM class_enrollments WHERE class_id = ann_class_id AND student_id = auth.uid()
    ) THEN true
    ELSE false
  END;
$$;

CREATE POLICY "Students can see their announcements" ON announcements
  FOR SELECT USING (check_announcement_access(class_id, recipient_id, announcement_type));

-- Announcement Reads
CREATE POLICY "Users can manage own read receipts" ON announcement_reads
  FOR ALL USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION check_instructor_for_announcement(ann_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM announcements a
    WHERE a.id = ann_id AND a.instructor_id = auth.uid()
  );
$$;

CREATE POLICY "Instructors can view read receipts for own announcements" ON announcement_reads
  FOR SELECT USING (check_instructor_for_announcement(announcement_id));

-- Activity Log
CREATE POLICY "Users can manage own activity" ON activity_log
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Instructors can view all activity" ON activity_log
  FOR SELECT USING (is_instructor());

-- Student Feedback
CREATE POLICY "Users can manage own feedback" ON student_feedback
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Instructors can view all feedback" ON student_feedback
  FOR SELECT USING (is_instructor());
