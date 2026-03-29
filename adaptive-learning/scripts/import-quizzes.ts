/**
 * Import quizzes from tab-delimited text files into structured gate quiz JSONs.
 *
 * Reads: ../Quiz Upload Files/Week 01 Knowledge Check.txt
 * Outputs: content/chapters/ch01/quizzes/gate-1.X.json
 *
 * Run: npx ts-node scripts/import-quizzes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface QuizOption {
  text: string;
  correct: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface GateQuiz {
  sectionId: string;
  chapterId: number;
  questions: QuizQuestion[];
  passThreshold: number; // percentage needed to pass (0-100)
}

// Map each question (by 1-based index) to a section based on topic analysis
// Q1: Business definition → 1.1
// Q2: Factors of production → 1.1
// Q3: Capitalist ownership → 1.2
// Q4: Economics definition → 1.3
// Q5: Macroeconomics focus → 1.4
// Q6: Equilibrium → 1.3
// Q7: Recession → 1.4
// Q8: Demand-pull inflation → 1.5
// Q9: Market structures → 1.7
// Q10: Federal Reserve → 1.5
// Q11: Structural unemployment → 1.5
// Q12: GDP definition → 1.4
// Q13: CPI → 1.5
// Q14: Fiscal policy → 1.5
// Q15: Technology → 1.8
const QUESTION_TO_SECTION: Record<number, string> = {
  1: '1.1',
  2: '1.1',
  3: '1.2',
  4: '1.3',
  5: '1.4',
  6: '1.3',
  7: '1.4',
  8: '1.5',
  9: '1.7',
  10: '1.5',
  11: '1.5',
  12: '1.4',
  13: '1.5',
  14: '1.5',
  15: '1.8',
};

// Brief explanations for each question (derived from correct answer context)
const EXPLANATIONS: Record<number, string> = {
  1: 'A business is an organization that strives for a profit by providing goods and services desired by its customers.',
  2: 'The five factors of production are natural resources, labor, capital, entrepreneurship, and knowledge. Profit is the result of business activity, not a factor of production.',
  3: 'In a capitalist (free market) economic system, businesses are primarily owned and operated by private individuals, not the government.',
  4: 'Economics is the study of how a society uses scarce resources to produce and distribute goods and services.',
  5: 'Macroeconomics looks at the economy as a whole, examining issues like GDP, inflation, and unemployment at the national level.',
  6: 'Equilibrium occurs when the quantity demanded by buyers equals the quantity supplied by sellers at a given price.',
  7: 'A recession is defined as a decline in GDP lasting at least two consecutive quarters.',
  8: 'Demand-pull inflation occurs when demand for goods and services exceeds the available supply, pulling prices upward.',
  9: 'Monopolistic competition features many firms offering products that are similar but differentiated (not identical), such as restaurants or clothing brands.',
  10: 'The Federal Reserve uses monetary policy tools to control the money supply and interest rates, influencing economic activity.',
  11: 'Structural unemployment results from a mismatch between workers\' skills and the skills needed for available jobs, often due to technological change.',
  12: 'GDP measures the total market value of all final goods and services produced within a nation\'s borders during a specific period.',
  13: 'The Consumer Price Index (CPI) tracks changes in the prices of a representative basket of consumer goods and services over time.',
  14: 'Fiscal policy involves the government adjusting its taxation and spending levels to influence the economy.',
  15: 'Technology is the application of science and engineering skills and knowledge to solve production and organizational problems.',
};

function parseQuizFile(filePath: string): QuizQuestion[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('\t');
    // Format: MC \t question \t option1 \t correct/incorrect \t option2 \t correct/incorrect ...
    if (parts[0] !== 'MC') continue;

    const questionText = parts[1];
    const options: QuizOption[] = [];

    // Parse option pairs (text, correct/incorrect)
    for (let j = 2; j < parts.length; j += 2) {
      if (j + 1 < parts.length) {
        options.push({
          text: parts[j],
          correct: parts[j + 1] === 'correct',
        });
      }
    }

    const qNum = i + 1;
    questions.push({
      id: `ch01-q${String(qNum).padStart(2, '0')}`,
      question: questionText,
      options,
      explanation: EXPLANATIONS[qNum] || '',
    });
  }

  return questions;
}

function groupBySections(questions: QuizQuestion[]): Record<string, QuizQuestion[]> {
  const groups: Record<string, QuizQuestion[]> = {};

  questions.forEach((q, index) => {
    const qNum = index + 1;
    const section = QUESTION_TO_SECTION[qNum];
    if (!groups[section]) groups[section] = [];
    groups[section].push(q);
  });

  return groups;
}

function main() {
  const quizFilePath = path.resolve(__dirname, '../../Quiz Upload Files/Week 01 Knowledge Check.txt');
  const outputDir = path.resolve(__dirname, '../content/chapters/ch01/quizzes');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Parse the quiz file
  const questions = parseQuizFile(quizFilePath);
  console.log(`Parsed ${questions.length} questions from Week 01 quiz file`);

  // Group by section
  const sectionGroups = groupBySections(questions);

  // Write gate quiz files for each section
  const allSections = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8'];

  for (const sectionId of allSections) {
    const sectionQuestions = sectionGroups[sectionId] || [];

    const gateQuiz: GateQuiz = {
      sectionId,
      chapterId: 1,
      questions: sectionQuestions,
      passThreshold: 80, // Must get ~80% right to pass
    };

    const outputPath = path.join(outputDir, `gate-${sectionId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(gateQuiz, null, 2));
    console.log(`  gate-${sectionId}.json: ${sectionQuestions.length} questions`);
  }

  // Also write the full quiz (all 15 questions) for chapter-level assessment
  const fullQuiz = {
    chapterId: 1,
    title: 'Week 1 Knowledge Check',
    questions,
    passThreshold: 80,
    timeLimit: 45, // minutes
    maxAttempts: 2,
  };
  const fullPath = path.join(outputDir, 'full-quiz.json');
  fs.writeFileSync(fullPath, JSON.stringify(fullQuiz, null, 2));
  console.log(`  full-quiz.json: ${questions.length} questions`);

  console.log('\nDone! Gate quiz files written to content/chapters/ch01/quizzes/');
}

main();
