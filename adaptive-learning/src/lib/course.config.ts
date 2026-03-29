// ============================================================
// Course Configuration — Single source of truth
// ============================================================
// Update this file when creating a new course from the template.
// All pages and API routes import from here instead of hardcoding.

/** Course slug used for course_id scoping in the shared database */
export const COURSE_ID = process.env.COURSE_SLUG || 'introduction-to-psychology';

export const courseConfig = {
  // Core identity
  title: "Introduction to Psychology",
  subtitle: "Adaptive Learning Platform",
  description:
    "Explore the science of mind and behavior at your own pace with AI-powered adaptive content. Master psychological concepts before moving on, with personalized feedback and support when you need it.",

  // Textbook info (used by content generation scripts)
  textbook: {
    name: "Psychology 2e (OpenStax)",
    pdfFilename: "Psychology2e_WEB.pdf",
  },

  // Capstone project (set enabled: false if the course has no capstone)
  capstone: {
    enabled: true,
    title: "Psychology Research Portfolio & Presentation",
    route: "/business-plan",
    navLabel: "Research Portfolio",
  },

  // AI tutor personality (used in system prompts for all AI endpoints)
  aiTutor: {
    role: "a friendly Introduction to Psychology tutor at a community college",
    tone: "warm, supportive, and encouraging",
  },
};
