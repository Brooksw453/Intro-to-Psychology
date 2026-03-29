import { createClient } from '@/lib/supabase/server';
import { getAllChapters, getAllAssignments } from '@/lib/content';
import { redirect } from 'next/navigation';
import ClassManager from './ClassManager';
import StudentRoster from './StudentRoster';
import AnnouncementPanel from './AnnouncementPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { courseConfig, COURSE_ID } from '@/lib/course.config';

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface ProgressRow {
  user_id: string;
  chapter_id: number;
  section_id: string;
  status: string;
  mastery_score: number | null;
}

interface QuizRow {
  user_id: string;
  score: number;
  passed: boolean;
}

interface DraftRow {
  user_id: string;
  assignment_id: number;
  section_key: string;
  draft_number: number;
  ai_feedback: { score: number } | null;
}

export default async function InstructorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Verify instructor role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['instructor', 'admin', 'super_admin'].includes(profile?.role)) {
    redirect('/chapters');
  }

  const chapters = getAllChapters();
  const assignments = getAllAssignments();
  const totalSections = chapters.reduce((sum, ch) => sum + ch.sections.length, 0);

  // Load classes for this instructor (handle table not existing yet)
  let classesData: Array<{ id: string; name: string; join_code: string; created_at: string }> = [];
  let enrollmentCounts: Record<string, number> = {};
  try {
    const { data: rawClasses } = await supabase
      .from('classes')
      .select('id, name, join_code, created_at')
      .eq('instructor_id', user.id)
      .eq('course_id', COURSE_ID)
      .order('created_at', { ascending: false });

    classesData = rawClasses || [];

    if (classesData.length > 0) {
      const classIds = classesData.map(c => c.id);
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .in('class_id', classIds);

      enrollmentCounts = (enrollments || []).reduce((acc: Record<string, number>, e: { class_id: string }) => {
        acc[e.class_id] = (acc[e.class_id] || 0) + 1;
        return acc;
      }, {});
    }
  } catch {
    // Tables may not exist yet if migration hasn't been run
  }

  const initialClasses = classesData.map(c => ({
    id: c.id,
    name: c.name,
    join_code: c.join_code,
    student_count: enrollmentCounts[c.id] || 0,
    created_at: c.created_at,
  }));

  // Load class enrollment mappings for student roster filtering
  let classEnrollmentMap: Record<string, string[]> = {};
  try {
    if (classesData.length > 0) {
      const classIds = classesData.map(c => c.id);
      const { data: enrollmentDetails } = await supabase
        .from('class_enrollments')
        .select('class_id, student_id')
        .in('class_id', classIds);

      (enrollmentDetails || []).forEach((e: { class_id: string; student_id: string }) => {
        if (!classEnrollmentMap[e.class_id]) {
          classEnrollmentMap[e.class_id] = [];
        }
        classEnrollmentMap[e.class_id].push(e.student_id);
      });
    }
  } catch {
    // Tables may not exist yet
  }

  // Load course-scoped data
  const [
    { data: allProgress },
    { data: allQuizzes },
    { data: allDrafts },
  ] = await Promise.all([
    supabase.from('section_progress').select('user_id, chapter_id, section_id, status, mastery_score').eq('course_id', COURSE_ID),
    supabase.from('quiz_attempts').select('user_id, score, passed').eq('course_id', COURSE_ID),
    supabase.from('assignment_drafts').select('user_id, assignment_id, section_key, draft_number, ai_feedback').eq('course_id', COURSE_ID),
  ]);

  // Derive student list from course-specific activity
  const courseUserIds = new Set<string>();
  (allProgress || []).forEach((p: ProgressRow) => courseUserIds.add(p.user_id));
  (allQuizzes || []).forEach((q: QuizRow) => courseUserIds.add(q.user_id));
  (allDrafts || []).forEach((d: DraftRow) => courseUserIds.add(d.user_id));

  let studentList: StudentRow[] = [];
  if (courseUserIds.size > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .in('id', Array.from(courseUserIds))
      .order('full_name');
    studentList = (data || []) as StudentRow[];
  }
  const progressList = (allProgress || []) as ProgressRow[];
  const quizList = (allQuizzes || []) as QuizRow[];
  const draftList = (allDrafts || []) as DraftRow[];

  // Class-level stats
  const totalStudents = studentList.length;

  // Per-student computed stats
  const studentStats = studentList.map(student => {
    const progress = progressList.filter(p => p.user_id === student.id);
    const completed = progress.filter(p => p.status === 'completed').length;
    const masteryScores = progress
      .filter(p => p.mastery_score !== null && p.mastery_score !== undefined)
      .map(p => p.mastery_score as number);
    const avgMastery = masteryScores.length > 0
      ? Math.round(masteryScores.reduce((s, v) => s + v, 0) / masteryScores.length)
      : 0;

    const quizzes = quizList.filter(q => q.user_id === student.id);
    const passedQuizzes = quizzes.filter(q => q.passed);
    const avgQuiz = passedQuizzes.length > 0
      ? Math.round(passedQuizzes.reduce((s, q) => s + q.score, 0) / passedQuizzes.length)
      : 0;

    const drafts = draftList.filter(d => d.user_id === student.id);
    // Get latest draft per assignment+section
    const latestDrafts = new Map<string, DraftRow>();
    drafts.forEach(d => {
      const key = `${d.assignment_id}-${d.section_key}`;
      const existing = latestDrafts.get(key);
      if (!existing || d.draft_number > existing.draft_number) {
        latestDrafts.set(key, d);
      }
    });
    const assignmentSections = Array.from(latestDrafts.values()).filter(d => d.ai_feedback);
    const totalAssignmentSections = assignments.reduce((s, a) => s + a.sections.length, 0);
    const avgAssignment = assignmentSections.length > 0
      ? Math.round(assignmentSections.reduce((s, d) => s + (d.ai_feedback?.score || 0), 0) / assignmentSections.length)
      : 0;

    return {
      ...student,
      completed,
      progressPercent: Math.round((completed / totalSections) * 100),
      avgMastery,
      avgQuiz,
      assignmentSectionsCompleted: assignmentSections.length,
      totalAssignmentSections,
      avgAssignment,
    };
  });

  // Class averages
  const activeStudents = studentStats.filter(s => s.completed > 0);
  const classAvgProgress = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((s, st) => s + st.progressPercent, 0) / activeStudents.length)
    : 0;
  const classAvgMastery = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((s, st) => s + st.avgMastery, 0) / activeStudents.length)
    : 0;
  const classAvgQuiz = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((s, st) => s + st.avgQuiz, 0) / activeStudents.length)
    : 0;

  // Chapter difficulty analysis
  const chapterStats = chapters.map(ch => {
    const chProgress = progressList.filter(p => p.chapter_id === ch.chapterId);
    const chCompleted = chProgress.filter(p => p.status === 'completed');
    const chMastery = chCompleted
      .filter(p => p.mastery_score !== null)
      .map(p => p.mastery_score as number);
    const avgMastery = chMastery.length > 0
      ? Math.round(chMastery.reduce((s, v) => s + v, 0) / chMastery.length)
      : null;
    const studentsStarted = new Set(chProgress.map(p => p.user_id)).size;
    const studentsCompleted = new Set(
      chProgress
        .filter(p => p.status === 'completed')
        .map(p => `${p.user_id}-${p.section_id}`)
    );
    // Count students who completed ALL sections
    const fullyCompleted = studentList.filter(st => {
      return ch.sections.every(secId =>
        studentsCompleted.has(`${st.id}-${secId}`)
      );
    }).length;

    return {
      chapterId: ch.chapterId,
      title: ch.title,
      sections: ch.sections.length,
      studentsStarted,
      studentsCompleted: fullyCompleted,
      avgMastery,
    };
  });

  // Sign out handler
  async function signOut() {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Instructor Dashboard</h1>
              <p className="text-indigo-200 text-xs sm:text-sm">{courseConfig.title} &bull; {courseConfig.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <a
                href="/instructor/feedback"
                className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white/20 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Student Feedback
              </a>
              <a
                href="/instructor/gradebook"
                className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white/20 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Gradebook
              </a>
              <a
                href="/api/instructor/export"
                className="px-2 py-1.5 sm:px-4 sm:py-2 bg-white/20 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Export Grades (CSV)
              </a>
              <ThemeToggle compact className="text-indigo-200 hover:text-white hover:bg-white/10" />
              <form action={signOut}>
                <button type="submit" className="text-xs sm:text-sm text-indigo-200 hover:text-white transition-colors">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 py-8">
        {/* Class Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalStudents}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Students</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeStudents.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Students</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{classAvgProgress}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{classAvgMastery}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Mastery</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{classAvgQuiz}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Quiz Score</div>
          </div>
        </div>

        {/* My Classes */}
        <ClassManager initialClasses={initialClasses} />

        {/* Student Roster */}
        <StudentRoster
          students={studentStats.map(s => ({
            id: s.id,
            full_name: s.full_name,
            email: s.email,
            progress: s.progressPercent,
            mastery: s.avgMastery,
            quizAvg: s.avgQuiz,
            assignmentProgress: s.assignmentSectionsCompleted > 0
              ? `${s.assignmentSectionsCompleted}/${s.totalAssignmentSections}`
              : '\u2014',
            assignmentAvg: s.avgAssignment,
            status: s.completed === 0
              ? 'Not Started'
              : s.progressPercent >= 100
                ? 'Complete'
                : s.avgMastery > 0 && s.avgMastery < 70
                  ? 'Struggling'
                  : 'In Progress',
          }))}
          classes={classesData.map(c => ({
            id: c.id,
            name: c.name,
            studentIds: classEnrollmentMap[c.id] || [],
          }))}
        />

        {/* Announcements */}
        <AnnouncementPanel
          classes={classesData.map(c => ({ id: c.id, name: c.name }))}
          students={studentList.map(s => ({ id: s.id, full_name: s.full_name, email: s.email }))}
        />

        {/* Chapter Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chapter Analytics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]" role="table" aria-label="Chapter analytics">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Chapter</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Sections</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Started</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Completed</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Avg Mastery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {chapterStats.map(ch => (
                  <tr key={ch.chapterId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Ch {ch.chapterId}: {ch.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{ch.sections}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{ch.studentsStarted}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">{ch.studentsCompleted}</td>
                    <td className="px-4 py-3 text-center">
                      {ch.avgMastery !== null ? (
                        <span className={`text-sm font-medium ${
                          ch.avgMastery >= 80 ? 'text-green-600' :
                          ch.avgMastery >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {ch.avgMastery}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
