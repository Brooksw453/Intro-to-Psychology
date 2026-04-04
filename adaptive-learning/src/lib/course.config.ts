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
    // Labels used throughout the capstone/portfolio UI
    labels: {
      finalTitle: "Final Research Portfolio",
      yourTitle: "Your Research Portfolio",
      compileDescription: "Compile your complete research portfolio",
      previewButton: "Preview Portfolio",
      printButton: "Print Portfolio",
      assignmentTag: "Portfolio Component",
      summaryPrompt: "Summarize your research findings, key insights, and conclusions in a compelling overview.",
      summaryPlaceholder: "Write a compelling summary of your entire research portfolio...",
      introPrompt: "Introduce your research portfolio. What drew you to this topic? What will the reader learn?",
      introPlaceholder: "Introduce your portfolio and the research journey behind it...",
    },
  },

  // AI tutor personality (used in system prompts for all AI endpoints)
  aiTutor: {
    role: "a friendly Introduction to Psychology tutor at a community college",
    tone: "warm, supportive, and encouraging",
  },

  // Pass/fail thresholds (used across quizzes, free-text, grades)
  thresholds: {
    freeTextPass: 70,
    gradeA: 90,
    gradeB: 80,
    gradeC: 70,
    gradeD: 60,
  },

  // Feature toggles
  features: {
    textToSpeech: true,
    speechToText: true,
    deepDive: true,
    askQuestion: true,
    draftChat: true,
  },

  // Attribution (required for OER/Creative Commons content)
  attribution: {
    enabled: true,
    sourceTitle: "Psychology 2e",
    sourceAuthors: "Rose M. Spielman, William J. Jenkins, Marilyn D. Lovett",
    sourceUrl: "https://openstax.org/details/books/psychology-2e",
    sourcePublisher: "OpenStax, Rice University",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    accessLine: "Access for free at openstax.org.",
    adaptedBy: "ES Designs",
    adaptationNote: "This adaptive learning platform adapts and remixes content from the original textbook with AI-powered tutoring, interactive quizzes, and written response evaluations.",
  },
};