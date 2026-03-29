/**
 * Import quizzes from ALL weekly tab-delimited text files into structured gate quiz JSONs.
 *
 * Reads: ../Quiz Upload Files/Week XX Knowledge Check.txt
 * Outputs: content/chapters/chXX/quizzes/gate-X.X.json
 *
 * Run: npx tsx scripts/import-all-quizzes.ts
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
  passThreshold: number;
}

// ─── Chapter configurations ──────────────────────────────────────────────────
// Each chapter defines its sections and question-to-section mapping

interface ChapterConfig {
  weekNum: number;
  chapterId: number;
  sections: string[];
  questionToSection: Record<number, string>;
  explanations: Record<number, string>;
}

const CHAPTERS: ChapterConfig[] = [
  // Chapter 1: Understanding Economic Systems and Business
  {
    weekNum: 1,
    chapterId: 1,
    sections: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8'],
    questionToSection: {
      1: '1.1', 2: '1.1', 3: '1.2', 4: '1.3', 5: '1.4',
      6: '1.3', 7: '1.4', 8: '1.5', 9: '1.7', 10: '1.5',
      11: '1.5', 12: '1.4', 13: '1.5', 14: '1.5', 15: '1.8',
    },
    explanations: {
      1: 'A business is an organization that strives for a profit by providing goods and services desired by its customers.',
      2: 'The five factors of production are natural resources, labor, capital, entrepreneurship, and knowledge.',
      3: 'In a capitalist (free market) economic system, businesses are primarily owned and operated by private individuals.',
      4: 'Economics is the study of how a society uses scarce resources to produce and distribute goods and services.',
      5: 'Macroeconomics looks at the economy as a whole, examining issues like GDP, inflation, and unemployment.',
      6: 'Equilibrium occurs when the quantity demanded equals the quantity supplied at a given price.',
      7: 'A recession is defined as a decline in GDP lasting at least two consecutive quarters.',
      8: 'Demand-pull inflation occurs when demand for goods and services exceeds the available supply.',
      9: 'Monopolistic competition features many firms offering similar but differentiated products.',
      10: 'The Federal Reserve uses monetary policy tools to control the money supply and interest rates.',
      11: 'Structural unemployment results from a mismatch between workers\' skills and available jobs.',
      12: 'GDP measures the total market value of all final goods and services produced within a nation\'s borders.',
      13: 'The Consumer Price Index (CPI) tracks changes in the prices of a representative basket of consumer goods.',
      14: 'Fiscal policy involves the government adjusting taxation and spending to influence the economy.',
      15: 'Technology is the application of science and engineering skills to solve production and organizational problems.',
    },
  },

  // Chapter 2: Making Ethical Decisions and Managing a Socially Responsible Business
  {
    weekNum: 2,
    chapterId: 2,
    sections: ['2.1', '2.2', '2.3', '2.4', '2.5'],
    questionToSection: {
      1: '2.1',  // Ethics definition
      2: '2.1',  // Utilitarianism
      3: '2.1',  // Deontology
      4: '2.2',  // Code of ethics
      5: '2.3',  // CSR definition
      6: '2.4',  // Stakeholder groups
      7: '2.5',  // Corporate philanthropy
      8: '2.5',  // Strategic giving
      9: '2.1',  // Justice concept
      10: '2.2', // Reporting unethical behavior
      11: '2.5', // Social investing
      12: '2.3', // CSR levels
      13: '2.2', // Encouraging ethical behavior
      14: '2.4', // Environmental responsibility
      15: '2.4', // New social contract
    },
    explanations: {
      1: 'Ethics is a set of moral standards for judging whether something is right or wrong.',
      2: 'Utilitarianism focuses on the consequences of an action, seeking the greatest good for the greatest number of people.',
      3: 'Deontology is based on following one\'s duty and obligations regardless of the consequences.',
      4: 'A code of ethics is a set of guidelines prepared by a firm to provide employees with knowledge of expected responsibilities and behavior.',
      5: 'Corporate social responsibility (CSR) is a business\'s concern for the welfare of society that goes beyond legal requirements.',
      6: 'Employees are a key stakeholder group that businesses have direct responsibilities toward, including fair treatment and safe working conditions.',
      7: 'Corporate philanthropy is the practice of charitable giving by corporations to benefit communities and causes.',
      8: 'Strategic giving ties a company\'s philanthropic efforts closely to its mission and goals for maximum impact.',
      9: 'Justice in ethics refers to the fair distribution of burdens and rewards according to prevailing standards of fairness.',
      10: 'Employees who witness unethical behavior should report it through appropriate channels such as supervisors, ethics hotlines, or compliance officers.',
      11: 'Social investing means limiting investments to companies that align with the investor\'s ethical beliefs and values.',
      12: 'A company that follows the law but does not go beyond legal requirements operates at the "legal but potentially irresponsible" level of CSR.',
      13: 'The most effective way to encourage ethical behavior is through top management leading by example and setting the tone.',
      14: 'A company that reduces its carbon footprint and uses sustainable materials demonstrates responsibility to the general public.',
      15: 'The "new social contract" suggests employees must contribute to adding value rather than simply filling a role.',
    },
  },

  // Chapter 3: Competing in the Global Marketplace
  {
    weekNum: 3,
    chapterId: 3,
    sections: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9'],
    questionToSection: {
      1: '3.1',  // Comparative advantage
      2: '3.1',  // Absolute advantage
      3: '3.2',  // Tariff
      4: '3.2',  // Embargo
      5: '3.3',  // Balance of trade
      6: '3.3',  // Trade deficit
      7: '3.5',  // Contract manufacturing
      8: '3.4',  // WTO
      9: '3.5',  // Joint venture
      10: '3.5', // Direct foreign investment
      11: '3.6', // Currency exchange rates
      12: '3.2', // Dumping
      13: '3.4', // NAFTA
      14: '3.2', // Protectionism
      15: '3.7', // Multinational corporations
    },
    explanations: {
      1: 'Comparative advantage means each country should specialize in producing goods where it has the lowest opportunity cost.',
      2: 'Absolute advantage exists when a country can produce a product at a lower cost than any other country.',
      3: 'A tariff is a tax imposed on imported goods, making them more expensive and protecting domestic producers.',
      4: 'An embargo is a total ban on imports or exports of a specific product or all trade with a particular country.',
      5: 'The balance of trade is the difference between the value of a country\'s exports and its imports.',
      6: 'A trade deficit occurs when a country imports more goods and services than it exports.',
      7: 'Contract manufacturing allows a foreign firm to manufacture products under your brand name, reducing investment risk.',
      8: 'The World Trade Organization (WTO) oversees international trade agreements and provides a forum for resolving trade disputes.',
      9: 'A joint venture involves a domestic firm buying part of a foreign firm or creating a new entity together to share risks and resources.',
      10: 'Direct foreign investment is the riskiest but potentially most rewarding way to enter a foreign market through ownership of facilities.',
      11: 'Most countries today use floating exchange rates determined by supply and demand in currency markets.',
      12: 'Dumping is the practice of charging a lower price for products in foreign markets than in the home market.',
      13: 'NAFTA (now USMCA) created a free-trade zone between Canada, Mexico, and the United States.',
      14: 'Protectionism involves protecting domestic industries from foreign competition through artificial barriers like tariffs and quotas.',
      15: 'Multinational corporations operate across national boundaries, managing production and marketing in multiple countries.',
    },
  },

  // Chapter 4: Forms of Business Ownership
  {
    weekNum: 4,
    chapterId: 4,
    sections: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7'],
    questionToSection: {
      1: '4.1',  // Sole proprietorship
      2: '4.1',  // Unlimited liability
      3: '4.2',  // General partnership
      4: '4.2',  // Limited partners
      5: '4.3',  // Corporation definition
      6: '4.3',  // Stockholders
      7: '4.3',  // Double taxation
      8: '4.4',  // S corporation
      9: '4.4',  // LLC
      10: '4.5', // Franchisor
      11: '4.6', // Horizontal merger
      12: '4.6', // Vertical merger
      13: '4.7', // Cooperative
      14: '4.1', // Sole proprietorship control
      15: '4.6', // LBO
    },
    explanations: {
      1: 'A sole proprietorship is the simplest and most common form of business ownership, owned and operated by one person.',
      2: 'The biggest disadvantage of a sole proprietorship is unlimited personal liability—the owner\'s personal assets can be used to pay business debts.',
      3: 'In a general partnership, all partners share unlimited liability for the business\'s debts and obligations.',
      4: 'Limited partners invest money but have liability limited to the amount of their investment and do not participate in day-to-day management.',
      5: 'A corporation is a legal entity that exists separately from its owners, with its own legal rights and obligations.',
      6: 'Stockholders (shareholders) are the owners of a corporation who have purchased shares of stock.',
      7: 'Double taxation means corporate profits are taxed at the corporate level and again when distributed as dividends to shareholders.',
      8: 'An S corporation avoids double taxation by being taxed like a partnership—profits pass through to shareholders\' personal tax returns.',
      9: 'A Limited Liability Company (LLC) combines corporation-like liability protection with the option of partnership-style taxation.',
      10: 'The franchisor is the company that supplies the product concept, brand, and business system in a franchise arrangement.',
      11: 'A horizontal merger combines two companies at the same stage in the same industry to increase market share.',
      12: 'A vertical merger combines companies at different stages in the same industry, such as a manufacturer merging with a supplier.',
      13: 'A cooperative is a legal entity owned by its members who unite to reduce costs and gain economic power through collective action.',
      14: 'A sole proprietorship gives the owner the most direct control over the business since they make all decisions.',
      15: 'A leveraged buyout (LBO) involves purchasing a company primarily using borrowed money, with the company\'s assets serving as collateral.',
    },
  },

  // Chapter 5: Entrepreneurship
  {
    weekNum: 5,
    chapterId: 5,
    sections: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8'],
    questionToSection: {
      1: '5.1', 2: '5.1', 3: '5.2', 4: '5.2', 5: '5.3',
      6: '5.3', 7: '5.4', 8: '5.4', 9: '5.5', 10: '5.5',
      11: '5.6', 12: '5.6', 13: '5.7', 14: '5.7', 15: '5.8',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 6: Management and Leadership
  {
    weekNum: 6,
    chapterId: 6,
    sections: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8'],
    questionToSection: {
      1: '6.1', 2: '6.1', 3: '6.2', 4: '6.2', 5: '6.3',
      6: '6.3', 7: '6.4', 8: '6.4', 9: '6.5', 10: '6.5',
      11: '6.6', 12: '6.6', 13: '6.7', 14: '6.7', 15: '6.8',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Week 7: Chapter 7 + Chapter 8 (split quiz)
  // Chapter 7: Designing Organizational Structures (7.1-7.8)
  // Chapter 8: Managing Human Resources (8.1-8.10)
  // We'll treat these as two chapters sharing one quiz
  {
    weekNum: 7,
    chapterId: 7, // Will split into ch07 and ch08
    sections: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8'],
    questionToSection: {
      1: '7.1', 2: '7.1', 3: '7.2', 4: '7.3', 5: '7.4',
      6: '7.5', 7: '7.6', 8: '7.7', 9: '7.8', 10: '7.8',
      11: '7.8', 12: '7.8', 13: '7.8', 14: '7.8', 15: '7.8',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 9: Motivating Employees (Week 8)
  {
    weekNum: 8,
    chapterId: 9,
    sections: ['9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.8'],
    questionToSection: {
      1: '9.1', 2: '9.1', 3: '9.2', 4: '9.2', 5: '9.3',
      6: '9.3', 7: '9.4', 8: '9.4', 9: '9.5', 10: '9.5',
      11: '9.6', 12: '9.6', 13: '9.7', 14: '9.7', 15: '9.8',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 10: Operations Management (Week 9)
  {
    weekNum: 9,
    chapterId: 10,
    sections: ['10.1', '10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8'],
    questionToSection: {
      1: '10.1', 2: '10.1', 3: '10.2', 4: '10.2', 5: '10.3',
      6: '10.3', 7: '10.4', 8: '10.4', 9: '10.5', 10: '10.5',
      11: '10.6', 12: '10.6', 13: '10.7', 14: '10.7', 15: '10.8',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 11: Products and Pricing (Week 10)
  {
    weekNum: 10,
    chapterId: 11,
    sections: ['11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '11.7', '11.8', '11.9', '11.10'],
    questionToSection: {
      1: '11.1', 2: '11.1', 3: '11.2', 4: '11.3', 5: '11.4',
      6: '11.5', 7: '11.6', 8: '11.7', 9: '11.8', 10: '11.8',
      11: '11.9', 12: '11.9', 13: '11.10', 14: '11.10', 15: '11.10',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 12: Distribution and Promotion (Week 11)
  {
    weekNum: 11,
    chapterId: 12,
    sections: ['12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '12.7', '12.8', '12.9', '12.10', '12.11'],
    questionToSection: {
      1: '12.1', 2: '12.2', 3: '12.3', 4: '12.4', 5: '12.5',
      6: '12.6', 7: '12.7', 8: '12.8', 9: '12.9', 10: '12.9',
      11: '12.10', 12: '12.10', 13: '12.11', 14: '12.11', 15: '12.11',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 13: Technology (Week 12)
  {
    weekNum: 12,
    chapterId: 13,
    sections: ['13.1', '13.2', '13.3', '13.4', '13.5', '13.6'],
    questionToSection: {
      1: '13.1', 2: '13.1', 3: '13.1', 4: '13.2', 5: '13.2',
      6: '13.3', 7: '13.3', 8: '13.4', 9: '13.4', 10: '13.5',
      11: '13.5', 12: '13.5', 13: '13.6', 14: '13.6', 15: '13.6',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Chapter 14: Accounting (Week 13)
  {
    weekNum: 13,
    chapterId: 14,
    sections: ['14.1', '14.2', '14.3', '14.4', '14.5', '14.6', '14.7', '14.8'],
    questionToSection: {
      1: '14.1', 2: '14.1', 3: '14.2', 4: '14.2', 5: '14.3',
      6: '14.3', 7: '14.4', 8: '14.4', 9: '14.5', 10: '14.5',
      11: '14.6', 12: '14.6', 13: '14.7', 14: '14.7', 15: '14.8',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },

  // Week 14: Chapter 15 + Chapter 16 (split quiz)
  {
    weekNum: 14,
    chapterId: 15,
    sections: ['15.1', '15.2', '15.3', '15.4', '15.5', '15.6'],
    questionToSection: {
      1: '15.1', 2: '15.1', 3: '15.2', 4: '15.2', 5: '15.3',
      6: '15.3', 7: '15.4', 8: '15.4', 9: '15.5', 10: '15.5',
      11: '15.6', 12: '15.6', 13: '15.6', 14: '15.6', 15: '15.6',
    },
    explanations: {
      1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '',
      9: '', 10: '', 11: '', 12: '', 13: '', 14: '', 15: '',
    },
  },
];

// ─── Quiz file parser ────────────────────────────────────────────────────────

function parseQuizFile(filePath: string, chapterId: number): QuizQuestion[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const questions: QuizQuestion[] = [];
  const chStr = String(chapterId).padStart(2, '0');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('\t');
    if (parts[0] !== 'MC') continue;

    const questionText = parts[1];
    const options: QuizOption[] = [];

    for (let j = 2; j < parts.length; j += 2) {
      if (j + 1 < parts.length) {
        options.push({
          text: parts[j],
          correct: parts[j + 1] === 'correct',
        });
      }
    }

    const qNum = questions.length + 1;
    questions.push({
      id: `ch${chStr}-q${String(qNum).padStart(2, '0')}`,
      question: questionText,
      options,
      explanation: '', // Will be filled from config
    });
  }

  return questions;
}

// ─── Auto-generate explanations from correct answer ──────────────────────────

function autoExplanation(q: QuizQuestion): string {
  const correct = q.options.find(o => o.correct);
  if (!correct) return '';
  return `The correct answer is "${correct.text}." ${q.question.replace(/:$/, '').replace(/\?$/, '')} — ${correct.text.toLowerCase()}.`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const quizDir = path.resolve(__dirname, '../../Quiz Upload Files');
  const contentDir = path.resolve(__dirname, '../content/chapters');

  let totalChapters = 0;
  let totalQuestions = 0;

  for (const chapter of CHAPTERS) {
    const weekStr = String(chapter.weekNum).padStart(2, '0');
    const quizFile = path.join(quizDir, `Week ${weekStr} Knowledge Check.txt`);

    if (!fs.existsSync(quizFile)) {
      console.log(`⚠️  Week ${weekStr} quiz file not found, skipping chapter ${chapter.chapterId}`);
      continue;
    }

    const chStr = String(chapter.chapterId).padStart(2, '0');
    const outputDir = path.join(contentDir, `ch${chStr}`, 'quizzes');
    fs.mkdirSync(outputDir, { recursive: true });

    // Parse quiz file
    const questions = parseQuizFile(quizFile, chapter.chapterId);
    console.log(`\n📝 Week ${weekStr} → Chapter ${chapter.chapterId}: ${questions.length} questions`);

    // Apply explanations from config (or auto-generate)
    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const configExplanation = chapter.explanations[qNum];
      q.explanation = configExplanation || autoExplanation(q);
    });

    // Group by section
    const sectionGroups: Record<string, QuizQuestion[]> = {};
    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const section = chapter.questionToSection[qNum];
      if (section) {
        if (!sectionGroups[section]) sectionGroups[section] = [];
        sectionGroups[section].push(q);
      }
    });

    // Write gate quiz files
    for (const sectionId of chapter.sections) {
      const sectionQuestions = sectionGroups[sectionId] || [];

      const gateQuiz: GateQuiz = {
        sectionId,
        chapterId: chapter.chapterId,
        questions: sectionQuestions,
        passThreshold: 80,
      };

      const outputPath = path.join(outputDir, `gate-${sectionId}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(gateQuiz, null, 2));
      console.log(`  gate-${sectionId}.json: ${sectionQuestions.length} questions`);
    }

    // Write full quiz
    const fullQuiz = {
      chapterId: chapter.chapterId,
      title: `Week ${chapter.weekNum} Knowledge Check`,
      questions,
      passThreshold: 80,
      timeLimit: 45,
      maxAttempts: 2,
    };
    fs.writeFileSync(path.join(outputDir, 'full-quiz.json'), JSON.stringify(fullQuiz, null, 2));
    console.log(`  full-quiz.json: ${questions.length} questions`);

    totalChapters++;
    totalQuestions += questions.length;
  }

  console.log(`\n✅ Done! Processed ${totalChapters} chapters, ${totalQuestions} total questions.`);
}

main();
