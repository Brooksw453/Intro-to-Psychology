const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'content', 'chapters');

function writeQuiz(chapter, sectionId, questions) {
  const ch = String(chapter).padStart(2, '0');
  const filePath = path.join(BASE, `ch${ch}`, 'quizzes', `gate-${sectionId}.json`);
  const data = {
    sectionId,
    chapterId: chapter,
    questions,
    passThreshold: 80
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`  ✓ Fixed ${filePath}`);
}

// Helper to read existing quiz and keep matching questions
function readQuiz(chapter, sectionId) {
  const ch = String(chapter).padStart(2, '0');
  const filePath = path.join(BASE, `ch${ch}`, 'quizzes', `gate-${sectionId}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch { return null; }
}

console.log('Fixing quiz questions across all chapters...\n');

// ==================== CHAPTER 1 ====================
console.log('Chapter 1:');

writeQuiz(1, '1.2', [
  {
    id: 'ch01-q03',
    question: 'Which of the following is part of the external business environment?',
    options: [
      { text: 'Company employees', correct: false },
      { text: 'The economic environment', correct: true },
      { text: 'Internal management policies', correct: false },
      { text: 'Company mission statement', correct: false }
    ],
    explanation: 'The correct answer is "The economic environment." The external business environment includes economic, political/legal, demographic, social, competitive, global, and technological sectors.'
  },
  {
    id: 'ch01-q03b',
    question: 'The internal business environment includes:',
    options: [
      { text: 'Government regulations and laws', correct: false },
      { text: 'Competitor strategies', correct: false },
      { text: "The company's corporate culture, management, and employees", correct: true },
      { text: 'Global trade agreements', correct: false }
    ],
    explanation: 'The correct answer is "The company\'s corporate culture, management, and employees." The internal environment encompasses factors within the organization itself.'
  }
]);

writeQuiz(1, '1.3', [
  {
    id: 'ch01-q05',
    question: 'In a communist economic system, who owns the factors of production?',
    options: [
      { text: 'Private individuals', correct: false },
      { text: 'The government', correct: true },
      { text: 'Corporations', correct: false },
      { text: 'Workers collectively', correct: false }
    ],
    explanation: 'The correct answer is "The government." In communism, the government owns virtually all resources and controls all markets.'
  },
  {
    id: 'ch01-q06',
    question: 'The circular flow model shows the movement of:',
    options: [
      { text: 'Resources, goods, services, and money between households and businesses', correct: true },
      { text: 'Only money between banks and businesses', correct: false },
      { text: 'Products from manufacturers to retailers', correct: false },
      { text: 'Workers from one industry to another', correct: false }
    ],
    explanation: 'The correct answer is "Resources, goods, services, and money between households and businesses." The circular flow model illustrates how resources and products flow between households and businesses.'
  }
]);

// Fix 1.5 - keep monetary/fiscal policy Qs, replace the 3 mismatched ones
writeQuiz(1, '1.5', [
  {
    id: 'ch01-q09',
    question: 'The Federal Reserve (the Fed) can slow down the economy by:',
    options: [
      { text: 'Lowering interest rates', correct: false },
      { text: 'Raising interest rates', correct: true },
      { text: 'Printing more money', correct: false },
      { text: 'Reducing taxes', correct: false }
    ],
    explanation: 'The correct answer is "Raising interest rates." When the Fed raises interest rates (contractionary policy), borrowing becomes more expensive, which slows economic activity.'
  },
  {
    id: 'ch01-q10',
    question: 'Fiscal policy involves the use of:',
    options: [
      { text: 'Interest rates set by the Federal Reserve', correct: false },
      { text: 'Government spending and taxation to influence the economy', correct: true },
      { text: 'Trade agreements with other countries', correct: false },
      { text: 'Corporate investment strategies', correct: false }
    ],
    explanation: 'The correct answer is "Government spending and taxation to influence the economy." Fiscal policy is set by the President and Congress through spending and tax decisions.'
  }
]);

// Fix 1.6 - was empty, add supply/demand questions
writeQuiz(1, '1.6', [
  {
    id: 'ch01-q14',
    question: 'When the quantity demanded equals the quantity supplied, this is known as:',
    options: [
      { text: 'A surplus', correct: false },
      { text: 'A shortage', correct: false },
      { text: 'Equilibrium', correct: true },
      { text: 'Inflation', correct: false }
    ],
    explanation: 'The correct answer is "Equilibrium." Equilibrium is the point where the supply and demand curves intersect, and the market clears.'
  },
  {
    id: 'ch01-q15',
    question: 'According to the law of demand, as the price of a product increases:',
    options: [
      { text: 'The quantity demanded increases', correct: false },
      { text: 'The quantity demanded decreases', correct: true },
      { text: 'Supply decreases', correct: false },
      { text: 'The market reaches equilibrium', correct: false }
    ],
    explanation: 'The correct answer is "The quantity demanded decreases." The law of demand states that as price rises, consumers will buy less of that product, all else being equal.'
  }
]);

// Fix 1.8
writeQuiz(1, '1.8', [
  {
    id: 'ch01-q16',
    question: 'Which trend is reshaping the modern business environment by enabling companies to reach global markets instantly?',
    options: [
      { text: 'Decreased competition', correct: false },
      { text: 'Digital technology and the internet', correct: true },
      { text: 'Reduced government regulation', correct: false },
      { text: 'Slower pace of change', correct: false }
    ],
    explanation: 'The correct answer is "Digital technology and the internet." Technology is a major trend transforming how businesses operate, compete, and reach customers globally.'
  },
  {
    id: 'ch01-q17',
    question: 'Sustainability in business refers to:',
    options: [
      { text: 'Maximizing short-term profits', correct: false },
      { text: 'Meeting present needs without compromising the ability of future generations to meet theirs', correct: true },
      { text: 'Reducing the number of employees', correct: false },
      { text: 'Focusing exclusively on shareholder value', correct: false }
    ],
    explanation: 'The correct answer is "Meeting present needs without compromising the ability of future generations to meet theirs." Sustainability is an increasingly important trend in business.'
  }
]);

// ==================== CHAPTER 2 ====================
console.log('Chapter 2:');

writeQuiz(2, '2.3', [
  {
    id: 'ch02-q09',
    question: "In Carroll's Pyramid of CSR, which level sits at the base as the foundation?",
    options: [
      { text: 'Philanthropic responsibility', correct: false },
      { text: 'Legal responsibility', correct: false },
      { text: 'Economic responsibility', correct: true },
      { text: 'Ethical responsibility', correct: false }
    ],
    explanation: 'The correct answer is "Economic responsibility." Carroll\'s Pyramid places economic responsibility at the base — a business must first be profitable to fulfill any other responsibilities.'
  },
  {
    id: 'ch02-q10',
    question: "Which level of Carroll's CSR Pyramid goes beyond legal requirements to do what is right and fair?",
    options: [
      { text: 'Economic responsibility', correct: false },
      { text: 'Legal responsibility', correct: false },
      { text: 'Ethical responsibility', correct: true },
      { text: 'Philanthropic responsibility', correct: false }
    ],
    explanation: 'The correct answer is "Ethical responsibility." Ethical responsibility means going beyond simply obeying the law to do what is right, just, and fair.'
  }
]);

writeQuiz(2, '2.4', [
  {
    id: 'ch02-q13',
    question: 'Which of the following is one of the four basic consumer rights outlined by President Kennedy?',
    options: [
      { text: 'The right to free products', correct: false },
      { text: 'The right to safety', correct: true },
      { text: 'The right to unlimited returns', correct: false },
      { text: 'The right to set prices', correct: false }
    ],
    explanation: 'The correct answer is "The right to safety." President Kennedy outlined four basic consumer rights: the right to safety, to be informed, to choose, and to be heard.'
  },
  {
    id: 'ch02-q14',
    question: "A company's responsibility to its investors includes:",
    options: [
      { text: 'Hiding financial problems to maintain stock price', correct: false },
      { text: 'Providing accurate financial information and managing resources wisely', correct: true },
      { text: 'Guaranteeing profits every quarter', correct: false },
      { text: 'Paying dividends regardless of profitability', correct: false }
    ],
    explanation: 'The correct answer is "Providing accurate financial information and managing resources wisely." Companies have a fiduciary duty to act in the best interest of their investors through transparency and responsible management.'
  }
]);

// ==================== CHAPTER 3 ====================
console.log('Chapter 3:');

writeQuiz(3, '3.7', [
  {
    id: 'ch03-q14',
    question: 'A multinational corporation (MNC) is a company that:',
    options: [
      { text: 'Only exports products to other countries', correct: false },
      { text: 'Has significant operations in multiple countries, managed from a central headquarters', correct: true },
      { text: 'Only imports goods from foreign suppliers', correct: false },
      { text: 'Operates exclusively within its home country', correct: false }
    ],
    explanation: 'The correct answer is "Has significant operations in multiple countries, managed from a central headquarters." MNCs are headquartered in their home country while maintaining significant operations abroad.'
  },
  {
    id: 'ch03-q15',
    question: 'One major advantage of multinational corporations is:',
    options: [
      { text: 'They are exempt from local laws', correct: false },
      { text: 'They can access new markets and diverse talent pools globally', correct: true },
      { text: 'They never face cultural challenges', correct: false },
      { text: 'They only pay taxes in their home country', correct: false }
    ],
    explanation: 'The correct answer is "They can access new markets and diverse talent pools globally." MNCs benefit from expanded market access, diverse talent, and economies of scale.'
  }
]);

// Fix empty 3.8
writeQuiz(3, '3.8', [
  {
    id: 'ch03-q16',
    question: 'Outsourcing differs from offshoring in that outsourcing:',
    options: [
      { text: 'Always involves moving jobs to another country', correct: false },
      { text: 'Means contracting work to an external company, which may or may not be in another country', correct: true },
      { text: 'Only applies to manufacturing jobs', correct: false },
      { text: 'Is illegal in most countries', correct: false }
    ],
    explanation: 'The correct answer is "Means contracting work to an external company, which may or may not be in another country." Outsourcing is about using external providers; offshoring specifically means moving operations to another country.'
  },
  {
    id: 'ch03-q17',
    question: 'A key driver of globalization is:',
    options: [
      { text: 'Decreased use of technology', correct: false },
      { text: 'Advances in communication and transportation technology', correct: true },
      { text: 'Higher trade barriers between nations', correct: false },
      { text: 'Reduced consumer demand worldwide', correct: false }
    ],
    explanation: 'The correct answer is "Advances in communication and transportation technology." Technology has been a primary driver enabling businesses to operate across borders more easily.'
  }
]);

// Fix empty 3.9
writeQuiz(3, '3.9', [
  {
    id: 'ch03-q18',
    question: 'Reshoring refers to:',
    options: [
      { text: 'Moving operations to a lower-cost country', correct: false },
      { text: 'Bringing manufacturing or business operations back to the home country', correct: true },
      { text: 'Opening new stores in coastal cities', correct: false },
      { text: 'Expanding into emerging markets', correct: false }
    ],
    explanation: 'The correct answer is "Bringing manufacturing or business operations back to the home country." Reshoring is the reverse of offshoring, driven by quality concerns, supply chain risks, and rising overseas costs.'
  },
  {
    id: 'ch03-q19',
    question: 'Emerging markets are attractive to global businesses because they offer:',
    options: [
      { text: 'No competition from local companies', correct: false },
      { text: 'Growing middle classes and expanding consumer demand', correct: true },
      { text: 'Guaranteed government subsidies', correct: false },
      { text: 'Fewer regulations than developed markets', correct: false }
    ],
    explanation: 'The correct answer is "Growing middle classes and expanding consumer demand." Emerging markets like China, India, and Brazil offer significant growth opportunities due to rising incomes and consumer spending.'
  }
]);

// ==================== CHAPTER 5 ====================
console.log('Chapter 5:');

writeQuiz(5, '5.2', [
  {
    id: 'ch05-q03',
    question: 'Which trait allows entrepreneurs to make informed decisions under uncertainty?',
    options: [
      { text: 'Conformity', correct: false },
      { text: 'Risk tolerance', correct: true },
      { text: 'Risk avoidance', correct: false },
      { text: 'Delegation', correct: false }
    ],
    explanation: 'The correct answer is "Risk tolerance." Successful entrepreneurs are comfortable making decisions and taking calculated risks even when outcomes are uncertain.'
  },
  {
    id: 'ch05-q04',
    question: 'The ability to spot a gap in the market that others overlook is called:',
    options: [
      { text: 'Financial planning', correct: false },
      { text: 'Opportunity recognition', correct: true },
      { text: 'Risk avoidance', correct: false },
      { text: 'Market saturation', correct: false }
    ],
    explanation: 'The correct answer is "Opportunity recognition." Entrepreneurs excel at identifying unmet needs and market gaps that can be turned into business opportunities.'
  }
]);

writeQuiz(5, '5.3', [
  {
    id: 'ch05-q05',
    question: 'According to the SBA, a small business generally has fewer than:',
    options: [
      { text: '100 employees', correct: false },
      { text: '250 employees', correct: false },
      { text: '500 employees', correct: true },
      { text: '1,000 employees', correct: false }
    ],
    explanation: 'The correct answer is "500 employees." The SBA generally defines a small business as one with fewer than 500 employees, though this varies by industry.'
  },
  {
    id: 'ch05-q06',
    question: 'Small businesses account for approximately what share of net new jobs created each year?',
    options: [
      { text: 'One-quarter', correct: false },
      { text: 'One-third', correct: false },
      { text: 'One-half', correct: false },
      { text: 'Two-thirds', correct: true }
    ],
    explanation: 'The correct answer is "Two-thirds." Small businesses are responsible for creating about two-thirds of net new jobs in the United States.'
  }
]);

writeQuiz(5, '5.4', [
  {
    id: 'ch05-q07',
    question: 'A formal written document describing a new business idea and how it will be carried out is a:',
    options: [
      { text: 'Marketing plan', correct: false },
      { text: 'Business plan', correct: true },
      { text: 'Financial statement', correct: false },
      { text: 'Incorporation form', correct: false }
    ],
    explanation: 'The correct answer is "Business plan." A business plan outlines the business concept, market analysis, financial projections, and operational strategy.'
  },
  {
    id: 'ch05-q08',
    question: 'The two main types of business financing are:',
    options: [
      { text: 'Grants and loans', correct: false },
      { text: 'Debt and equity', correct: true },
      { text: 'Savings and credit', correct: false },
      { text: 'Revenue and profit', correct: false }
    ],
    explanation: 'The correct answer is "Debt and equity." Debt financing involves borrowing money to be repaid, while equity financing involves selling ownership shares in the business.'
  }
]);

writeQuiz(5, '5.5', [
  {
    id: 'ch05-q09',
    question: 'The most common reason small businesses fail is:',
    options: [
      { text: 'Too much competition', correct: false },
      { text: 'Poor management', correct: true },
      { text: 'High taxes', correct: false },
      { text: 'Bad location', correct: false }
    ],
    explanation: 'The correct answer is "Poor management." Inadequate management skills, including poor financial planning and inability to manage growth, is the leading cause of small business failure.'
  },
  {
    id: 'ch05-q10',
    question: 'The level of sales at which total revenue equals total costs is called the:',
    options: [
      { text: 'Profit margin', correct: false },
      { text: 'Break-even point', correct: true },
      { text: 'Return on investment', correct: false },
      { text: 'Cash flow point', correct: false }
    ],
    explanation: 'The correct answer is "Break-even point." The break-even point is where revenue exactly covers all costs — neither profit nor loss.'
  }
]);

writeQuiz(5, '5.6', [
  {
    id: 'ch05-q11',
    question: 'Small businesses produce roughly how many more patents per employee than large firms?',
    options: [
      { text: '2 times more', correct: false },
      { text: '8 times more', correct: false },
      { text: '16 times more', correct: true },
      { text: '25 times more', correct: false }
    ],
    explanation: 'The correct answer is "16 times more." Small businesses are powerful engines of innovation, producing approximately 16 times more patents per employee than large firms.'
  },
  {
    id: 'ch05-q12',
    question: 'A key competitive advantage of small businesses over large corporations is:',
    options: [
      { text: 'Greater access to capital', correct: false },
      { text: 'Agility — the ability to respond quickly to market changes', correct: true },
      { text: 'Lower employee turnover', correct: false },
      { text: 'More brand recognition', correct: false }
    ],
    explanation: 'The correct answer is "Agility — the ability to respond quickly to market changes." Small businesses can adapt faster than large corporations due to fewer layers of bureaucracy.'
  }
]);

writeQuiz(5, '5.7', [
  {
    id: 'ch05-q13',
    question: "The SBA's primary loan program that guarantees loans up to $5 million is called the:",
    options: [
      { text: 'Microloan Program', correct: false },
      { text: '7(a) Loan Program', correct: true },
      { text: '504 Loan Program', correct: false },
      { text: 'Venture Capital Program', correct: false }
    ],
    explanation: 'The correct answer is "7(a) Loan Program." The 7(a) loan is the SBA\'s most common loan program, providing guarantees on loans up to $5 million for small businesses.'
  },
  {
    id: 'ch05-q14',
    question: 'SCORE provides small business owners with:',
    options: [
      { text: 'Direct cash grants', correct: false },
      { text: 'Free mentoring from experienced business volunteers', correct: true },
      { text: 'Tax exemptions', correct: false },
      { text: 'Guaranteed government contracts', correct: false }
    ],
    explanation: 'The correct answer is "Free mentoring from experienced business volunteers." SCORE is an SBA-supported program that pairs small business owners with experienced mentors.'
  }
]);

writeQuiz(5, '5.8', [
  {
    id: 'ch05-q15',
    question: 'A business that prioritizes solving social or environmental problems while generating revenue is called a:',
    options: [
      { text: 'Nonprofit organization', correct: false },
      { text: 'Social enterprise', correct: true },
      { text: 'Government agency', correct: false },
      { text: 'Traditional corporation', correct: false }
    ],
    explanation: 'The correct answer is "Social enterprise." Social enterprises use business models to address social or environmental challenges while remaining financially sustainable.'
  },
  {
    id: 'ch05-q16',
    question: 'The gig economy is characterized by:',
    options: [
      { text: 'Long-term employment contracts', correct: false },
      { text: 'Short-term, flexible, freelance work', correct: true },
      { text: 'Government-guaranteed jobs', correct: false },
      { text: 'Only manufacturing positions', correct: false }
    ],
    explanation: 'The correct answer is "Short-term, flexible, freelance work." The gig economy consists of independent contractors, freelancers, and temporary workers rather than traditional permanent employees.'
  }
]);

// ==================== CHAPTER 6 ====================
console.log('Chapter 6:');

writeQuiz(6, '6.2', [
  {
    id: 'ch06-q03',
    question: 'A strategic planning tool that evaluates Strengths, Weaknesses, Opportunities, and Threats is called a:',
    options: [
      { text: 'Business plan', correct: false },
      { text: 'SWOT analysis', correct: true },
      { text: 'Balance sheet', correct: false },
      { text: 'Performance review', correct: false }
    ],
    explanation: 'The correct answer is "SWOT analysis." SWOT analysis helps organizations evaluate their internal strengths and weaknesses and external opportunities and threats.'
  },
  {
    id: 'ch06-q04',
    question: 'Long-range planning conducted by top management that sets the overall direction for the organization is called:',
    options: [
      { text: 'Operational planning', correct: false },
      { text: 'Tactical planning', correct: false },
      { text: 'Strategic planning', correct: true },
      { text: 'Contingency planning', correct: false }
    ],
    explanation: 'The correct answer is "Strategic planning." Strategic planning is done by top management and sets the broad direction and long-term goals for the entire organization.'
  }
]);

writeQuiz(6, '6.3', [
  {
    id: 'ch06-q05',
    question: "A manager's span of control refers to:",
    options: [
      { text: 'The total budget a manager controls', correct: false },
      { text: 'The number of employees a manager supervises directly', correct: true },
      { text: 'The number of departments in the organization', correct: false },
      { text: 'The geographic area a manager oversees', correct: false }
    ],
    explanation: 'The correct answer is "The number of employees a manager supervises directly." Span of control determines how many subordinates report directly to a single manager.'
  },
  {
    id: 'ch06-q06',
    question: 'The process of grouping jobs into logical units like departments is called:',
    options: [
      { text: 'Delegation', correct: false },
      { text: 'Departmentalization', correct: true },
      { text: 'Centralization', correct: false },
      { text: 'Specialization', correct: false }
    ],
    explanation: 'The correct answer is "Departmentalization." Departmentalization organizes employees into groups based on function, product, customer, geographic location, or process.'
  }
]);

writeQuiz(6, '6.4', [
  {
    id: 'ch06-q07',
    question: 'Which leadership style involves employees in decision-making?',
    options: [
      { text: 'Autocratic', correct: false },
      { text: 'Democratic (participative)', correct: true },
      { text: 'Laissez-faire', correct: false },
      { text: 'Bureaucratic', correct: false }
    ],
    explanation: 'The correct answer is "Democratic (participative)." Democratic leaders involve employees in the decision-making process, fostering collaboration and engagement.'
  },
  {
    id: 'ch06-q08',
    question: 'Giving employees the authority, resources, and confidence to make decisions is called:',
    options: [
      { text: 'Micromanagement', correct: false },
      { text: 'Employee empowerment', correct: true },
      { text: 'Delegation of authority', correct: false },
      { text: 'Performance appraisal', correct: false }
    ],
    explanation: 'The correct answer is "Employee empowerment." Empowerment gives employees autonomy and trust to make decisions, increasing motivation and productivity.'
  }
]);

writeQuiz(6, '6.5', [
  {
    id: 'ch06-q09',
    question: 'The controlling function of management involves:',
    options: [
      { text: 'Hiring and training employees', correct: false },
      { text: 'Setting performance standards, measuring results, and taking corrective action', correct: true },
      { text: 'Creating the company mission statement', correct: false },
      { text: 'Organizing departments', correct: false }
    ],
    explanation: 'The correct answer is "Setting performance standards, measuring results, and taking corrective action." Controlling ensures organizational activities are on track to meet goals.'
  },
  {
    id: 'ch06-q10',
    question: 'A measurable value that demonstrates how effectively an organization is achieving its key objectives is called a:',
    options: [
      { text: 'Mission statement', correct: false },
      { text: 'Key Performance Indicator (KPI)', correct: true },
      { text: 'SWOT analysis', correct: false },
      { text: 'Business plan', correct: false }
    ],
    explanation: 'The correct answer is "Key Performance Indicator (KPI)." KPIs are quantifiable measures used to evaluate success in meeting performance objectives.'
  }
]);

writeQuiz(6, '6.6', [
  {
    id: 'ch06-q11',
    question: "According to Mintzberg, managers fulfill three categories of roles. Which is NOT one of them?",
    options: [
      { text: 'Interpersonal roles', correct: false },
      { text: 'Informational roles', correct: false },
      { text: 'Decisional roles', correct: false },
      { text: 'Technical roles', correct: true }
    ],
    explanation: 'The correct answer is "Technical roles." Mintzberg identified three categories: interpersonal (figurehead, leader, liaison), informational (monitor, disseminator, spokesperson), and decisional (entrepreneur, disturbance handler, resource allocator, negotiator).'
  },
  {
    id: 'ch06-q12',
    question: 'When a manager responds to unexpected problems and crises, they are performing the role of:',
    options: [
      { text: 'Figurehead', correct: false },
      { text: 'Entrepreneur', correct: false },
      { text: 'Disturbance handler', correct: true },
      { text: 'Monitor', correct: false }
    ],
    explanation: 'The correct answer is "Disturbance handler." In this decisional role, managers deal with unexpected events, conflicts, and crises that require immediate attention.'
  }
]);

writeQuiz(6, '6.7', [
  {
    id: 'ch06-q13',
    question: 'Which management skill involves the ability to see the organization as a whole and think strategically?',
    options: [
      { text: 'Technical skills', correct: false },
      { text: 'Human relations skills', correct: false },
      { text: 'Conceptual skills', correct: true },
      { text: 'Operational skills', correct: false }
    ],
    explanation: 'The correct answer is "Conceptual skills." Conceptual skills enable managers to understand the big picture, think abstractly, and develop strategies for the organization.'
  },
  {
    id: 'ch06-q14',
    question: 'The ability to recognize and manage your own emotions while responding to others\' emotions is called:',
    options: [
      { text: 'Technical expertise', correct: false },
      { text: 'Emotional intelligence', correct: true },
      { text: 'Cognitive ability', correct: false },
      { text: 'Managerial authority', correct: false }
    ],
    explanation: 'The correct answer is "Emotional intelligence." Emotional intelligence includes self-awareness, self-regulation, motivation, empathy, and social skills — all critical for effective management.'
  }
]);

writeQuiz(6, '6.8', [
  {
    id: 'ch06-q15',
    question: 'A flexible, iterative management approach that emphasizes short work cycles and rapid response to change is called:',
    options: [
      { text: 'Bureaucratic management', correct: false },
      { text: 'Agile management', correct: true },
      { text: 'Scientific management', correct: false },
      { text: 'Autocratic management', correct: false }
    ],
    explanation: 'The correct answer is "Agile management." Agile management uses short sprints, continuous feedback, and iterative improvement to adapt quickly to changing conditions.'
  },
  {
    id: 'ch06-q16',
    question: 'Managing remote and hybrid teams effectively requires:',
    options: [
      { text: 'Constant surveillance of employee screens', correct: false },
      { text: 'Clear communication, trust, and results-based accountability', correct: true },
      { text: 'Eliminating all meetings', correct: false },
      { text: 'Requiring all employees to work the same hours', correct: false }
    ],
    explanation: 'The correct answer is "Clear communication, trust, and results-based accountability." Effective remote management focuses on outcomes rather than micromanaging how and when work gets done.'
  }
]);

// ==================== CHAPTER 7 ====================
console.log('Chapter 7:');

writeQuiz(7, '7.2', [
  {
    id: 'ch07-q03',
    question: 'Work specialization (division of labor) involves:',
    options: [
      { text: 'Every employee performing all tasks', correct: false },
      { text: 'Breaking work into smaller, specialized tasks performed by different people', correct: true },
      { text: 'Eliminating job descriptions', correct: false },
      { text: 'Rotating all employees through every department', correct: false }
    ],
    explanation: 'The correct answer is "Breaking work into smaller, specialized tasks performed by different people." Work specialization increases efficiency but can lead to boredom if taken too far.'
  },
  {
    id: 'ch07-q04',
    question: 'A job design approach that adds variety, autonomy, and decision-making responsibility to a role is called:',
    options: [
      { text: 'Job rotation', correct: false },
      { text: 'Job enlargement', correct: false },
      { text: 'Job enrichment', correct: true },
      { text: 'Job elimination', correct: false }
    ],
    explanation: 'The correct answer is "Job enrichment." Job enrichment adds depth to a job by giving employees more control, responsibility, and meaningful tasks.'
  }
]);

writeQuiz(7, '7.4', [
  {
    id: 'ch07-q07',
    question: 'In a decentralized organization:',
    options: [
      { text: 'All decisions are made by top management', correct: false },
      { text: 'Decision-making authority is distributed to lower-level managers', correct: true },
      { text: 'There is no formal chain of command', correct: false },
      { text: 'Employees cannot make any decisions', correct: false }
    ],
    explanation: 'The correct answer is "Decision-making authority is distributed to lower-level managers." Decentralization pushes decisions closer to the front lines where managers have the most relevant information.'
  },
  {
    id: 'ch07-q08',
    question: 'A flat organizational structure has:',
    options: [
      { text: 'Many levels of management and narrow spans of control', correct: false },
      { text: 'Few levels of management and wide spans of control', correct: true },
      { text: 'No managers at all', correct: false },
      { text: 'Only one level of employees', correct: false }
    ],
    explanation: 'The correct answer is "Few levels of management and wide spans of control." Flat organizations have fewer hierarchical layers, enabling faster communication and greater employee autonomy.'
  }
]);

writeQuiz(7, '7.5', [
  {
    id: 'ch07-q09',
    question: 'In a line-and-staff organization, staff positions provide:',
    options: [
      { text: 'Direct authority over line workers', correct: false },
      { text: 'Specialized advice and support to line managers', correct: true },
      { text: 'Customer service only', correct: false },
      { text: 'Manufacturing labor', correct: false }
    ],
    explanation: 'The correct answer is "Specialized advice and support to line managers." Staff positions (like HR, legal, IT) provide expertise and recommendations but typically do not have direct authority over line operations.'
  },
  {
    id: 'ch07-q10',
    question: 'In a matrix organization, employees:',
    options: [
      { text: 'Report to only one manager', correct: false },
      { text: 'Report to two or more managers', correct: true },
      { text: 'Have no direct supervisor', correct: false },
      { text: 'Work independently without teams', correct: false }
    ],
    explanation: 'The correct answer is "Report to two or more managers." In a matrix structure, employees have dual reporting relationships — typically to both a functional manager and a project manager.'
  }
]);

writeQuiz(7, '7.6', [
  {
    id: 'ch07-q11',
    question: 'An organizational structure characterized by high specialization, centralized authority, and extensive rules is called a:',
    options: [
      { text: 'Organic organization', correct: false },
      { text: 'Mechanistic organization', correct: true },
      { text: 'Virtual organization', correct: false },
      { text: 'Matrix organization', correct: false }
    ],
    explanation: 'The correct answer is "Mechanistic organization." Mechanistic structures are highly formalized with rigid hierarchies, well-suited for stable environments.'
  },
  {
    id: 'ch07-q12',
    question: 'An organic organization is best suited for:',
    options: [
      { text: 'Stable, predictable environments', correct: false },
      { text: 'Dynamic, rapidly changing environments', correct: true },
      { text: 'Government agencies only', correct: false },
      { text: 'Very large corporations only', correct: false }
    ],
    explanation: 'The correct answer is "Dynamic, rapidly changing environments." Organic structures are flexible, decentralized, and collaborative — ideal for adapting to change and fostering innovation.'
  }
]);

writeQuiz(7, '7.7', [
  {
    id: 'ch07-q13',
    question: 'The informal channel through which information spreads throughout an organization is called the:',
    options: [
      { text: 'Chain of command', correct: false },
      { text: 'Grapevine', correct: true },
      { text: 'Organizational chart', correct: false },
      { text: 'Staff meeting', correct: false }
    ],
    explanation: 'The correct answer is "Grapevine." The grapevine is an informal communication network that exists alongside the formal organizational structure.'
  },
  {
    id: 'ch07-q14',
    question: 'Organizational culture refers to:',
    options: [
      { text: 'The formal organizational chart', correct: false },
      { text: 'The shared values, beliefs, and norms that influence how employees behave', correct: true },
      { text: 'The physical layout of the office', correct: false },
      { text: 'The company\'s financial performance', correct: false }
    ],
    explanation: 'The correct answer is "The shared values, beliefs, and norms that influence how employees behave." Organizational culture shapes how work gets done and how people interact within the company.'
  }
]);

writeQuiz(7, '7.8', [
  {
    id: 'ch07-q15',
    question: 'A networked organization that outsources many functions and connects a small core team with external partners is called a:',
    options: [
      { text: 'Bureaucratic organization', correct: false },
      { text: 'Virtual organization', correct: true },
      { text: 'Line organization', correct: false },
      { text: 'Functional organization', correct: false }
    ],
    explanation: 'The correct answer is "Virtual organization." Virtual organizations maintain a small core staff and use technology to coordinate with external partners and freelancers.'
  },
  {
    id: 'ch07-q16',
    question: 'The gig economy is characterized by:',
    options: [
      { text: 'Lifelong employment with one company', correct: false },
      { text: 'Short-term, flexible, freelance work rather than permanent employment', correct: true },
      { text: 'Only government jobs', correct: false },
      { text: 'Mandatory overtime for all workers', correct: false }
    ],
    explanation: 'The correct answer is "Short-term, flexible, freelance work rather than permanent employment." The gig economy represents a shift toward independent, project-based work.'
  }
]);

// ==================== CHAPTER 9 ====================
console.log('Chapter 9:');

writeQuiz(9, '9.1', [
  {
    id: 'ch09-q01',
    question: "Frederick Taylor's scientific management focused on:",
    options: [
      { text: 'Employee satisfaction and happiness', correct: false },
      { text: 'Finding the most efficient way to perform each task', correct: true },
      { text: 'Giving workers more decision-making power', correct: false },
      { text: 'Reducing the number of managers', correct: false }
    ],
    explanation: 'The correct answer is "Finding the most efficient way to perform each task." Taylor used time and motion studies to determine the one best way to do each job for maximum efficiency.'
  },
  {
    id: 'ch09-q02',
    question: 'The Hawthorne Studies found that worker productivity increased primarily because:',
    options: [
      { text: 'Workers were paid more money', correct: false },
      { text: 'Workers felt special attention and were cared about by management', correct: true },
      { text: 'Working hours were reduced', correct: false },
      { text: 'New technology was introduced', correct: false }
    ],
    explanation: 'The correct answer is "Workers felt special attention and were cared about by management." The Hawthorne effect showed that paying attention to workers and making them feel valued increased productivity.'
  }
]);

writeQuiz(9, '9.2', [
  {
    id: 'ch09-q03',
    question: "According to Maslow, which need must be satisfied first?",
    options: [
      { text: 'Safety needs', correct: false },
      { text: 'Social needs', correct: false },
      { text: 'Physiological needs', correct: true },
      { text: 'Self-actualization needs', correct: false }
    ],
    explanation: 'The correct answer is "Physiological needs." Maslow\'s hierarchy places basic physiological needs (food, water, shelter) at the base — these must be met before higher-level needs can motivate behavior.'
  },
  {
    id: 'ch09-q04',
    question: "In Maslow's hierarchy, the desire for recognition, status, and achievement falls under:",
    options: [
      { text: 'Social needs', correct: false },
      { text: 'Safety needs', correct: false },
      { text: 'Esteem needs', correct: true },
      { text: 'Self-actualization needs', correct: false }
    ],
    explanation: 'The correct answer is "Esteem needs." Esteem needs include the desire for recognition, respect, status, and a sense of accomplishment.'
  }
]);

writeQuiz(9, '9.4', [
  {
    id: 'ch09-q07',
    question: "According to Herzberg, which of the following is a hygiene factor?",
    options: [
      { text: 'Recognition for achievement', correct: false },
      { text: 'Working conditions and company policies', correct: true },
      { text: 'Opportunities for growth', correct: false },
      { text: 'The work itself', correct: false }
    ],
    explanation: 'The correct answer is "Working conditions and company policies." Hygiene factors (pay, conditions, policies, job security) can cause dissatisfaction if poor, but improving them alone does not motivate.'
  },
  {
    id: 'ch09-q08',
    question: "According to Herzberg, what truly motivates employees?",
    options: [
      { text: 'Higher salary and better benefits', correct: false },
      { text: 'Recognition, achievement, and growth opportunities', correct: true },
      { text: 'More vacation time', correct: false },
      { text: 'Better office furniture', correct: false }
    ],
    explanation: 'The correct answer is "Recognition, achievement, and growth opportunities." Motivator factors relate to the work itself and create genuine job satisfaction and motivation.'
  }
]);

writeQuiz(9, '9.5', [
  {
    id: 'ch09-q09',
    question: 'Expectancy theory suggests that motivation depends on:',
    options: [
      { text: 'How much an employee is paid', correct: false },
      { text: "An employee's belief that effort leads to performance, and performance leads to valued rewards", correct: true },
      { text: 'The number of hours worked', correct: false },
      { text: 'Seniority in the organization', correct: false }
    ],
    explanation: 'The correct answer is "An employee\'s belief that effort leads to performance, and performance leads to valued rewards." Expectancy theory links motivation to three beliefs: expectancy, instrumentality, and valence.'
  },
  {
    id: 'ch09-q10',
    question: 'Equity theory suggests that employees are motivated when they:',
    options: [
      { text: 'Earn the highest salary possible', correct: false },
      { text: 'Perceive their input-to-outcome ratio as fair compared to others', correct: true },
      { text: 'Work fewer hours than their colleagues', correct: false },
      { text: 'Have the most prestigious job title', correct: false }
    ],
    explanation: 'The correct answer is "Perceive their input-to-outcome ratio as fair compared to others." Equity theory states that employees compare what they contribute versus what they receive relative to their peers.'
  }
]);

writeQuiz(9, '9.7', [
  {
    id: 'ch09-q13',
    question: 'A compensation system where employees receive a share of company profits is called:',
    options: [
      { text: 'Base salary', correct: false },
      { text: 'Profit sharing', correct: true },
      { text: 'Commission', correct: false },
      { text: 'Hourly wages', correct: false }
    ],
    explanation: 'The correct answer is "Profit sharing." Profit sharing distributes a portion of company profits to employees, aligning their interests with organizational success.'
  },
  {
    id: 'ch09-q14',
    question: 'Stock options as an employee benefit allow workers to:',
    options: [
      { text: 'Receive free products from the company', correct: false },
      { text: 'Purchase company stock at a predetermined price', correct: true },
      { text: 'Vote on company strategy', correct: false },
      { text: 'Take unlimited vacation days', correct: false }
    ],
    explanation: 'The correct answer is "Purchase company stock at a predetermined price." Stock options give employees the right to buy shares at a fixed price, motivating them to help increase the company\'s value.'
  }
]);

writeQuiz(9, '9.8', [
  {
    id: 'ch09-q15',
    question: 'A work arrangement that allows employees to choose their starting and ending times within limits is called:',
    options: [
      { text: 'Job sharing', correct: false },
      { text: 'Flextime', correct: true },
      { text: 'Telecommuting', correct: false },
      { text: 'Shift work', correct: false }
    ],
    explanation: 'The correct answer is "Flextime." Flextime gives employees flexibility in scheduling their work hours, improving work-life balance and job satisfaction.'
  },
  {
    id: 'ch09-q16',
    question: 'Purpose-driven work refers to:',
    options: [
      { text: 'Working only for a paycheck', correct: false },
      { text: "Employees finding meaning and significance in their work beyond financial compensation", correct: true },
      { text: 'Working overtime every week', correct: false },
      { text: 'Following strict procedures without question', correct: false }
    ],
    explanation: 'The correct answer is "Employees finding meaning and significance in their work beyond financial compensation." Research shows that purpose-driven work is a powerful motivator, especially for younger generations.'
  }
]);

// ==================== CHAPTER 10 ====================
console.log('Chapter 10:');

writeQuiz(10, '10.1', [
  {
    id: 'ch10-q01',
    question: 'Operations management is the process of:',
    options: [
      { text: 'Only manufacturing physical products', correct: false },
      { text: 'Managing the production of goods and services efficiently', correct: true },
      { text: 'Marketing products to consumers', correct: false },
      { text: 'Managing employee salaries', correct: false }
    ],
    explanation: 'The correct answer is "Managing the production of goods and services efficiently." Operations management applies to both manufacturing and service organizations.'
  },
  {
    id: 'ch10-q02',
    question: 'A key difference between manufacturing and service operations is:',
    options: [
      { text: 'Services produce tangible outputs while manufacturing produces intangible ones', correct: false },
      { text: 'Manufacturing produces tangible goods while services produce intangible experiences', correct: true },
      { text: 'There is no difference', correct: false },
      { text: 'Services require more raw materials', correct: false }
    ],
    explanation: 'The correct answer is "Manufacturing produces tangible goods while services produce intangible experiences." This distinction affects how operations are managed in each type of organization.'
  }
]);

writeQuiz(10, '10.2', [
  {
    id: 'ch10-q03',
    question: 'Mass customization combines:',
    options: [
      { text: 'Low cost with no variety', correct: false },
      { text: 'The efficiency of mass production with the personalization of custom products', correct: true },
      { text: 'Manual labor with automation', correct: false },
      { text: 'Domestic and international production', correct: false }
    ],
    explanation: 'The correct answer is "The efficiency of mass production with the personalization of custom products." Mass customization allows companies to produce personalized products at near mass-production costs.'
  },
  {
    id: 'ch10-q04',
    question: 'A continuous production process is best suited for:',
    options: [
      { text: 'One-of-a-kind custom products', correct: false },
      { text: 'High-volume, standardized products produced around the clock', correct: true },
      { text: 'Small batch orders', correct: false },
      { text: 'Seasonal products only', correct: false }
    ],
    explanation: 'The correct answer is "High-volume, standardized products produced around the clock." Continuous processes run without interruption and are ideal for products like oil, chemicals, and beverages.'
  }
]);

writeQuiz(10, '10.3', [
  {
    id: 'ch10-q05',
    question: 'When choosing a facility location, which factor considers access to highways, railroads, and ports?',
    options: [
      { text: 'Labor supply', correct: false },
      { text: 'Transportation infrastructure', correct: true },
      { text: 'Tax incentives', correct: false },
      { text: 'Climate conditions', correct: false }
    ],
    explanation: 'The correct answer is "Transportation infrastructure." Proximity to transportation networks is crucial for efficiently receiving materials and distributing finished products.'
  },
  {
    id: 'ch10-q06',
    question: 'Proximity to raw materials is most important for:',
    options: [
      { text: 'Software companies', correct: false },
      { text: 'Companies that process heavy or perishable materials', correct: true },
      { text: 'Online retailers', correct: false },
      { text: 'Consulting firms', correct: false }
    ],
    explanation: 'The correct answer is "Companies that process heavy or perishable materials." Being close to raw materials reduces transportation costs and spoilage for these types of businesses.'
  }
]);

writeQuiz(10, '10.4', [
  {
    id: 'ch10-q07',
    question: 'A product layout (assembly line) is best suited for:',
    options: [
      { text: 'Custom, one-of-a-kind products', correct: false },
      { text: 'High-volume production of standardized products', correct: true },
      { text: 'Construction of large structures', correct: false },
      { text: 'Small repair shops', correct: false }
    ],
    explanation: 'The correct answer is "High-volume production of standardized products." Product layouts arrange equipment along a sequential line, optimizing flow for repetitive manufacturing.'
  },
  {
    id: 'ch10-q08',
    question: 'A fixed-position layout is used when:',
    options: [
      { text: 'Products are small and lightweight', correct: false },
      { text: 'The product is too large or heavy to move, so workers and equipment come to it', correct: true },
      { text: 'All products are identical', correct: false },
      { text: 'The factory is very small', correct: false }
    ],
    explanation: 'The correct answer is "The product is too large or heavy to move, so workers and equipment come to it." Fixed-position layouts are used for shipbuilding, aircraft manufacturing, and construction.'
  }
]);

writeQuiz(10, '10.5', [
  {
    id: 'ch10-q09',
    question: 'Just-in-time (JIT) inventory management aims to:',
    options: [
      { text: 'Keep large stockpiles of inventory as backup', correct: false },
      { text: 'Receive materials just when they are needed in production', correct: true },
      { text: 'Order inventory once per year', correct: false },
      { text: 'Eliminate all suppliers', correct: false }
    ],
    explanation: 'The correct answer is "Receive materials just when they are needed in production." JIT minimizes inventory holding costs by coordinating delivery with production schedules.'
  },
  {
    id: 'ch10-q10',
    question: 'Enterprise resource planning (ERP) systems:',
    options: [
      { text: 'Only manage inventory', correct: false },
      { text: 'Integrate all business functions into a single unified system', correct: true },
      { text: 'Are used only by small businesses', correct: false },
      { text: 'Replace all human workers', correct: false }
    ],
    explanation: 'The correct answer is "Integrate all business functions into a single unified system." ERP systems connect manufacturing, finance, HR, and supply chain into one coordinated platform.'
  }
]);

writeQuiz(10, '10.6', [
  {
    id: 'ch10-q11',
    question: 'A Gantt chart is used to:',
    options: [
      { text: 'Calculate profit margins', correct: false },
      { text: 'Schedule and track project tasks over time', correct: true },
      { text: 'Determine product pricing', correct: false },
      { text: 'Measure employee performance', correct: false }
    ],
    explanation: 'The correct answer is "Schedule and track project tasks over time." Gantt charts display tasks as horizontal bars on a timeline, making it easy to see progress and dependencies.'
  },
  {
    id: 'ch10-q12',
    question: 'In PERT analysis, the critical path represents:',
    options: [
      { text: 'The shortest route through a project', correct: false },
      { text: 'The longest sequence of tasks that determines the minimum project completion time', correct: true },
      { text: 'The most expensive tasks', correct: false },
      { text: 'Tasks that can be skipped', correct: false }
    ],
    explanation: 'The correct answer is "The longest sequence of tasks that determines the minimum project completion time." Any delay on the critical path delays the entire project.'
  }
]);

writeQuiz(10, '10.7', [
  {
    id: 'ch10-q13',
    question: 'Total quality management (TQM) emphasizes:',
    options: [
      { text: 'Inspecting products only at the end of production', correct: false },
      { text: 'Continuous improvement and involvement of all employees in quality', correct: true },
      { text: 'Minimizing costs at the expense of quality', correct: false },
      { text: 'Quality control by managers only', correct: false }
    ],
    explanation: 'The correct answer is "Continuous improvement and involvement of all employees in quality." TQM makes quality everyone\'s responsibility and emphasizes ongoing incremental improvements.'
  },
  {
    id: 'ch10-q14',
    question: 'The Six Sigma methodology aims to:',
    options: [
      { text: 'Increase production speed regardless of errors', correct: false },
      { text: 'Reduce product defects to near zero (3.4 per million)', correct: true },
      { text: 'Eliminate all human workers from production', correct: false },
      { text: 'Double company revenue', correct: false }
    ],
    explanation: 'The correct answer is "Reduce product defects to near zero (3.4 per million)." Six Sigma uses data-driven methods (DMAIC) to systematically eliminate defects and variation.'
  }
]);

writeQuiz(10, '10.8', [
  {
    id: 'ch10-q15',
    question: 'Computer-aided design (CAD) uses computers to:',
    options: [
      { text: 'Manufacture products on assembly lines', correct: false },
      { text: 'Design and modify product specifications', correct: true },
      { text: 'Manage employee schedules', correct: false },
      { text: 'Process customer orders', correct: false }
    ],
    explanation: 'The correct answer is "Design and modify product specifications." CAD software allows engineers to create, modify, and test product designs digitally before physical production.'
  },
  {
    id: 'ch10-q16',
    question: '3D printing (additive manufacturing) creates products by:',
    options: [
      { text: 'Cutting material from a solid block', correct: false },
      { text: 'Building objects layer by layer from digital models', correct: true },
      { text: 'Molding plastic in traditional factories', correct: false },
      { text: 'Hand-assembling components', correct: false }
    ],
    explanation: 'The correct answer is "Building objects layer by layer from digital models." 3D printing enables rapid prototyping and custom production without traditional tooling.'
  }
]);

// ==================== CHAPTER 11 ====================
console.log('Chapter 11:');

writeQuiz(11, '11.1', [
  {
    id: 'ch11-q01',
    question: 'The marketing concept begins with:',
    options: [
      { text: 'Developing a product and finding buyers', correct: false },
      { text: 'Identifying customer needs and wants', correct: true },
      { text: 'Setting the lowest possible price', correct: false },
      { text: 'Creating advertising campaigns', correct: false }
    ],
    explanation: 'The correct answer is "Identifying customer needs and wants." The marketing concept focuses on understanding what customers need first, then creating products to satisfy those needs.'
  },
  {
    id: 'ch11-q02',
    question: 'Relationship marketing focuses on:',
    options: [
      { text: 'Making one-time sales at the highest price', correct: false },
      { text: 'Building long-term partnerships with customers', correct: true },
      { text: 'Eliminating customer service departments', correct: false },
      { text: 'Selling only to new customers', correct: false }
    ],
    explanation: 'The correct answer is "Building long-term partnerships with customers." Relationship marketing emphasizes customer retention and loyalty over single transactions.'
  }
]);

writeQuiz(11, '11.2', [
  {
    id: 'ch11-q03',
    question: 'The marketing mix consists of:',
    options: [
      { text: 'Advertising, sales, and public relations', correct: false },
      { text: 'Product, Price, Place, and Promotion', correct: true },
      { text: 'Supply, demand, and equilibrium', correct: false },
      { text: 'Planning, organizing, leading, and controlling', correct: false }
    ],
    explanation: 'The correct answer is "Product, Price, Place, and Promotion." The 4 Ps of the marketing mix are the key controllable elements marketers use to reach their target market.'
  },
  {
    id: 'ch11-q04',
    question: 'A target market is:',
    options: [
      { text: 'Every possible consumer in the world', correct: false },
      { text: 'The specific group of consumers a firm directs its marketing efforts toward', correct: true },
      { text: 'Only customers who have purchased before', correct: false },
      { text: 'The company\'s competitors', correct: false }
    ],
    explanation: 'The correct answer is "The specific group of consumers a firm directs its marketing efforts toward." Companies identify target markets to focus resources on the customers most likely to buy.'
  }
]);

writeQuiz(11, '11.3', [
  {
    id: 'ch11-q05',
    question: 'The consumer decision-making process begins with:',
    options: [
      { text: 'Comparing alternatives', correct: false },
      { text: 'Recognizing a need or problem', correct: true },
      { text: 'Making a purchase', correct: false },
      { text: 'Seeking information', correct: false }
    ],
    explanation: 'The correct answer is "Recognizing a need or problem." The decision process starts when a consumer identifies a gap between their current state and desired state.'
  },
  {
    id: 'ch11-q06',
    question: 'Reference groups influence consumer behavior by:',
    options: [
      { text: 'Setting government regulations', correct: false },
      { text: 'Shaping attitudes and behaviors through social influence', correct: true },
      { text: 'Determining product prices', correct: false },
      { text: 'Manufacturing products', correct: false }
    ],
    explanation: 'The correct answer is "Shaping attitudes and behaviors through social influence." Reference groups (family, friends, colleagues) significantly influence purchasing decisions.'
  }
]);

writeQuiz(11, '11.4', [
  {
    id: 'ch11-q07',
    question: 'Market segmentation is:',
    options: [
      { text: 'Selling the same product to everyone', correct: false },
      { text: 'Dividing a market into distinct groups with similar needs', correct: true },
      { text: 'Eliminating unprofitable products', correct: false },
      { text: 'Setting different prices for different stores', correct: false }
    ],
    explanation: 'The correct answer is "Dividing a market into distinct groups with similar needs." Segmentation allows companies to tailor their marketing to specific customer groups.'
  },
  {
    id: 'ch11-q08',
    question: 'Psychographic segmentation divides markets based on:',
    options: [
      { text: 'Age, income, and education', correct: false },
      { text: 'Personality, lifestyle, and values', correct: true },
      { text: 'Geographic location', correct: false },
      { text: 'Purchase frequency', correct: false }
    ],
    explanation: 'The correct answer is "Personality, lifestyle, and values." Psychographic segmentation goes beyond demographics to understand why consumers make the choices they do.'
  }
]);

writeQuiz(11, '11.5', [
  {
    id: 'ch11-q09',
    question: 'Products that consumers buy frequently with little planning are called:',
    options: [
      { text: 'Shopping products', correct: false },
      { text: 'Specialty products', correct: false },
      { text: 'Convenience products', correct: true },
      { text: 'Unsought products', correct: false }
    ],
    explanation: 'The correct answer is "Convenience products." Convenience products are bought frequently, immediately, and with minimal comparison shopping (e.g., snacks, toiletries).'
  },
  {
    id: 'ch11-q10',
    question: 'The three levels of a product are:',
    options: [
      { text: 'Small, medium, and large', correct: false },
      { text: 'Core benefit, actual product, and augmented product', correct: true },
      { text: 'Design, packaging, and pricing', correct: false },
      { text: 'Basic, premium, and luxury', correct: false }
    ],
    explanation: 'The correct answer is "Core benefit, actual product, and augmented product." The core is the fundamental benefit, the actual product is the tangible item, and augmented includes extras like warranty and support.'
  }
]);

writeQuiz(11, '11.6', [
  {
    id: 'ch11-q11',
    question: 'The new product development process typically begins with:',
    options: [
      { text: 'Test marketing', correct: false },
      { text: 'Idea generation', correct: true },
      { text: 'Commercialization', correct: false },
      { text: 'Prototype development', correct: false }
    ],
    explanation: 'The correct answer is "Idea generation." The NPD process starts with generating ideas from various sources including customers, employees, competitors, and R&D.'
  },
  {
    id: 'ch11-q12',
    question: 'A common reason new products fail is:',
    options: [
      { text: 'Too much market research', correct: false },
      { text: 'Inadequate understanding of customer needs', correct: true },
      { text: 'Prices that are too low', correct: false },
      { text: 'Too much advertising', correct: false }
    ],
    explanation: 'The correct answer is "Inadequate understanding of customer needs." Many products fail because companies develop what they think customers want rather than researching actual needs.'
  }
]);

writeQuiz(11, '11.7', [
  {
    id: 'ch11-q13',
    question: 'The four stages of the product life cycle are:',
    options: [
      { text: 'Planning, production, distribution, retirement', correct: false },
      { text: 'Introduction, growth, maturity, decline', correct: true },
      { text: 'Concept, design, launch, profit', correct: false },
      { text: 'Research, development, marketing, sales', correct: false }
    ],
    explanation: 'The correct answer is "Introduction, growth, maturity, decline." Each stage requires different marketing strategies as the product moves through its lifecycle.'
  },
  {
    id: 'ch11-q14',
    question: 'During the maturity stage of the product life cycle:',
    options: [
      { text: 'Sales are growing rapidly', correct: false },
      { text: 'Sales level off and competition intensifies', correct: true },
      { text: 'The product has just been launched', correct: false },
      { text: 'The product is being discontinued', correct: false }
    ],
    explanation: 'The correct answer is "Sales level off and competition intensifies." In the maturity stage, most potential customers have adopted the product and companies compete mainly on price and differentiation.'
  }
]);

writeQuiz(11, '11.8', [
  {
    id: 'ch11-q15',
    question: 'Price skimming involves:',
    options: [
      { text: 'Setting the lowest possible price to attract buyers', correct: false },
      { text: 'Setting a high initial price and lowering it over time', correct: true },
      { text: 'Matching competitor prices exactly', correct: false },
      { text: 'Giving products away for free', correct: false }
    ],
    explanation: 'The correct answer is "Setting a high initial price and lowering it over time." Skimming targets early adopters willing to pay premium prices before reducing prices to attract more price-sensitive customers.'
  },
  {
    id: 'ch11-q16',
    question: 'Value-based pricing sets prices based on:',
    options: [
      { text: 'The cost of production plus a markup', correct: false },
      { text: 'What customers perceive the product is worth', correct: true },
      { text: 'Whatever competitors charge', correct: false },
      { text: 'Government price controls', correct: false }
    ],
    explanation: 'The correct answer is "What customers perceive the product is worth." Value-based pricing focuses on the perceived value to the customer rather than production costs.'
  }
]);

writeQuiz(11, '11.9', [
  {
    id: 'ch11-q17',
    question: 'Brand equity refers to:',
    options: [
      { text: 'The physical assets a brand owns', correct: false },
      { text: 'The added value a well-known brand name gives a product', correct: true },
      { text: 'The number of products a company sells', correct: false },
      { text: 'The cost of creating a brand logo', correct: false }
    ],
    explanation: 'The correct answer is "The added value a well-known brand name gives a product." Strong brand equity means customers are willing to pay more for a product because of its brand reputation.'
  },
  {
    id: 'ch11-q18',
    question: 'A brand extension is when a company:',
    options: [
      { text: 'Creates an entirely new brand name', correct: false },
      { text: 'Uses an existing brand name to launch a product in a new category', correct: true },
      { text: 'Discontinues a brand', correct: false },
      { text: 'Changes its company name', correct: false }
    ],
    explanation: 'The correct answer is "Uses an existing brand name to launch a product in a new category." Brand extensions leverage existing brand recognition to enter new markets with lower risk.'
  }
]);

writeQuiz(11, '11.10', [
  {
    id: 'ch11-q19',
    question: 'Influencer marketing involves:',
    options: [
      { text: 'Only using television advertisements', correct: false },
      { text: 'Partnering with individuals who have significant social media followings to promote products', correct: true },
      { text: 'Hiring more sales representatives', correct: false },
      { text: 'Reducing marketing budgets', correct: false }
    ],
    explanation: 'The correct answer is "Partnering with individuals who have significant social media followings to promote products." Influencer marketing leverages trust and reach of social media personalities.'
  },
  {
    id: 'ch11-q20',
    question: 'Omnichannel marketing means:',
    options: [
      { text: 'Using only one marketing channel', correct: false },
      { text: 'Providing a seamless customer experience across all channels (online, mobile, in-store)', correct: true },
      { text: 'Eliminating physical stores', correct: false },
      { text: 'Marketing only through email', correct: false }
    ],
    explanation: 'The correct answer is "Providing a seamless customer experience across all channels (online, mobile, in-store)." Omnichannel strategies integrate all touchpoints so customers have a consistent experience.'
  }
]);

// ==================== CHAPTER 12 ====================
console.log('Chapter 12:');

writeQuiz(12, '12.3', [
  {
    id: 'ch12-q05',
    question: 'A category killer is a retailer that:',
    options: [
      { text: 'Sells a small variety of expensive products', correct: false },
      { text: 'Dominates a specific product category with wide selection and low prices', correct: true },
      { text: 'Only sells online', correct: false },
      { text: 'Operates as a franchise', correct: false }
    ],
    explanation: 'The correct answer is "Dominates a specific product category with wide selection and low prices." Category killers like Home Depot or Best Buy offer such deep selection in their category that smaller competitors struggle.'
  },
  {
    id: 'ch12-q06',
    question: 'Omnichannel retailing involves:',
    options: [
      { text: 'Selling only in physical stores', correct: false },
      { text: 'Integrating online, mobile, and in-store shopping into a seamless experience', correct: true },
      { text: 'Selling only through one channel', correct: false },
      { text: 'Eliminating customer service', correct: false }
    ],
    explanation: 'The correct answer is "Integrating online, mobile, and in-store shopping into a seamless experience." Omnichannel retailing lets customers browse, buy, and return through any combination of channels.'
  }
]);

writeQuiz(12, '12.4', [
  {
    id: 'ch12-q07',
    question: 'Supply chain management involves:',
    options: [
      { text: 'Only managing warehouse inventory', correct: false },
      { text: 'Coordinating the flow of materials, information, and finances from suppliers to consumers', correct: true },
      { text: 'Only shipping finished products', correct: false },
      { text: 'Managing employee schedules', correct: false }
    ],
    explanation: 'The correct answer is "Coordinating the flow of materials, information, and finances from suppliers to consumers." SCM integrates all members of the supply chain for maximum efficiency.'
  },
  {
    id: 'ch12-q08',
    question: 'RFID technology helps supply chains by:',
    options: [
      { text: 'Replacing human workers entirely', correct: false },
      { text: 'Tracking inventory and shipments in real time using radio frequency identification', correct: true },
      { text: 'Reducing product quality', correct: false },
      { text: 'Eliminating the need for warehouses', correct: false }
    ],
    explanation: 'The correct answer is "Tracking inventory and shipments in real time using radio frequency identification." RFID tags allow automatic tracking of products throughout the supply chain.'
  }
]);

writeQuiz(12, '12.5', [
  {
    id: 'ch12-q09',
    question: 'Intensive distribution means:',
    options: [
      { text: 'Selling through one exclusive retailer', correct: false },
      { text: 'Placing products in as many outlets as possible', correct: true },
      { text: 'Selling only online', correct: false },
      { text: 'Limiting distribution to specialty stores', correct: false }
    ],
    explanation: 'The correct answer is "Placing products in as many outlets as possible." Intensive distribution is used for convenience products that consumers want to find everywhere (e.g., soft drinks, snacks).'
  },
  {
    id: 'ch12-q10',
    question: 'Channel conflict occurs when:',
    options: [
      { text: 'All channel members cooperate perfectly', correct: false },
      { text: 'Channel members disagree over goals, roles, or rewards', correct: true },
      { text: 'Customers buy too many products', correct: false },
      { text: 'A company has too few distribution channels', correct: false }
    ],
    explanation: 'The correct answer is "Channel members disagree over goals, roles, or rewards." Conflict can occur between manufacturers and retailers or between different levels of the distribution channel.'
  }
]);

writeQuiz(12, '12.7', [
  {
    id: 'ch12-q13',
    question: 'Institutional advertising is designed to:',
    options: [
      { text: 'Sell a specific product', correct: false },
      { text: 'Build a positive image for the company or organization as a whole', correct: true },
      { text: 'Compare prices with competitors', correct: false },
      { text: 'Generate immediate sales', correct: false }
    ],
    explanation: 'The correct answer is "Build a positive image for the company or organization as a whole." Unlike product advertising, institutional advertising promotes the company\'s reputation and values.'
  },
  {
    id: 'ch12-q14',
    question: 'Cost per thousand (CPM) measures:',
    options: [
      { text: 'Total advertising budget', correct: false },
      { text: 'The cost of reaching 1,000 members of the target audience', correct: true },
      { text: 'The number of ads placed per month', correct: false },
      { text: 'Customer satisfaction with ads', correct: false }
    ],
    explanation: 'The correct answer is "The cost of reaching 1,000 members of the target audience." CPM helps advertisers compare the cost-effectiveness of different media options.'
  }
]);

writeQuiz(12, '12.8', [
  {
    id: 'ch12-q15',
    question: 'The personal selling process begins with:',
    options: [
      { text: 'Closing the sale', correct: false },
      { text: 'Prospecting and qualifying leads', correct: true },
      { text: 'Handling objections', correct: false },
      { text: 'Following up after purchase', correct: false }
    ],
    explanation: 'The correct answer is "Prospecting and qualifying leads." The first step is identifying potential customers and determining if they have the need, authority, and ability to buy.'
  },
  {
    id: 'ch12-q16',
    question: 'Consultative selling differs from traditional selling in that it:',
    options: [
      { text: 'Uses high-pressure tactics', correct: false },
      { text: 'Focuses on understanding customer problems and providing tailored solutions', correct: true },
      { text: 'Avoids all customer contact', correct: false },
      { text: 'Only works for low-price products', correct: false }
    ],
    explanation: 'The correct answer is "Focuses on understanding customer problems and providing tailored solutions." Consultative selling positions the salesperson as a trusted advisor rather than a pushy seller.'
  }
]);

writeQuiz(12, '12.9', [
  {
    id: 'ch12-q17',
    question: 'Sales promotion activities are designed to:',
    options: [
      { text: 'Replace advertising entirely', correct: false },
      { text: 'Stimulate immediate buying through short-term incentives', correct: true },
      { text: 'Build long-term brand image only', correct: false },
      { text: 'Reduce product quality', correct: false }
    ],
    explanation: 'The correct answer is "Stimulate immediate buying through short-term incentives." Sales promotions (coupons, samples, contests) create urgency and encourage quick purchase decisions.'
  },
  {
    id: 'ch12-q18',
    question: 'A loyalty program is an example of:',
    options: [
      { text: 'Public relations', correct: false },
      { text: 'Consumer sales promotion', correct: true },
      { text: 'Personal selling', correct: false },
      { text: 'Institutional advertising', correct: false }
    ],
    explanation: 'The correct answer is "Consumer sales promotion." Loyalty programs reward repeat purchases, encouraging customers to continue buying from the same brand.'
  }
]);

writeQuiz(12, '12.10', [
  {
    id: 'ch12-q19',
    question: 'Public relations differs from advertising in that PR:',
    options: [
      { text: 'Always costs more than advertising', correct: false },
      { text: 'Often involves earning media coverage rather than paying for ad space', correct: true },
      { text: 'Is never used by large companies', correct: false },
      { text: 'Only uses social media', correct: false }
    ],
    explanation: 'The correct answer is "Often involves earning media coverage rather than paying for ad space." PR generates publicity through press releases, events, and media relations rather than purchased ad placements.'
  },
  {
    id: 'ch12-q20',
    question: 'Crisis management in PR involves:',
    options: [
      { text: 'Ignoring negative publicity', correct: false },
      { text: 'Developing plans to protect and restore a company\'s reputation during negative events', correct: true },
      { text: 'Only issuing press releases', correct: false },
      { text: 'Avoiding all media contact', correct: false }
    ],
    explanation: 'The correct answer is "Developing plans to protect and restore a company\'s reputation during negative events." Effective crisis management requires preparation, transparency, and swift response.'
  }
]);

writeQuiz(12, '12.11', [
  {
    id: 'ch12-q21',
    question: 'Social commerce refers to:',
    options: [
      { text: 'Selling products only in physical stores', correct: false },
      { text: 'Using social media platforms to directly sell products and services', correct: true },
      { text: 'Donating profits to charity', correct: false },
      { text: 'Cold calling customers', correct: false }
    ],
    explanation: 'The correct answer is "Using social media platforms to directly sell products and services." Social commerce integrates shopping features directly into social media platforms like Instagram and Facebook.'
  },
  {
    id: 'ch12-q22',
    question: 'Mobile commerce (m-commerce) refers to:',
    options: [
      { text: 'Shopping at mobile pop-up stores', correct: false },
      { text: 'Buying and selling goods and services through mobile devices', correct: true },
      { text: 'Moving inventory between warehouses', correct: false },
      { text: 'Selling cars and vehicles', correct: false }
    ],
    explanation: 'The correct answer is "Buying and selling goods and services through mobile devices." M-commerce has grown rapidly as smartphones become the primary way many consumers shop online.'
  }
]);

// ==================== CHAPTERS 13-15 ====================
// Now read and fix chapters 13-15

async function fixChapter13to15() {
  // We need to read section content to write accurate questions
  // For these, we'll write questions based on the section topics described in the audit

  console.log('Chapter 13:');

  writeQuiz(13, '13.1', [
    {
      id: 'ch13-q01',
      question: 'Information technology (IT) in business refers to:',
      options: [
        { text: 'Only computer hardware', correct: false },
        { text: 'The use of technology to create, store, exchange, and use information', correct: true },
        { text: 'Social media marketing only', correct: false },
        { text: 'Telephone systems only', correct: false }
      ],
      explanation: 'The correct answer is "The use of technology to create, store, exchange, and use information." IT encompasses hardware, software, networks, and data management systems.'
    },
    {
      id: 'ch13-q02',
      question: 'Digital transformation involves:',
      options: [
        { text: 'Simply buying new computers', correct: false },
        { text: 'Fundamentally changing how a business operates and delivers value using digital technology', correct: true },
        { text: 'Eliminating all paper documents', correct: false },
        { text: 'Only updating the company website', correct: false }
      ],
      explanation: 'The correct answer is "Fundamentally changing how a business operates and delivers value using digital technology." Digital transformation goes beyond technology adoption to reshape business models and processes.'
    }
  ]);

  writeQuiz(13, '13.3', [
    {
      id: 'ch13-q05',
      question: 'A management information system (MIS) provides:',
      options: [
        { text: 'Raw unprocessed data only', correct: false },
        { text: 'Managers with reports and tools to support decision-making', correct: true },
        { text: 'Customer entertainment', correct: false },
        { text: 'Employee training materials', correct: false }
      ],
      explanation: 'The correct answer is "Managers with reports and tools to support decision-making." MIS processes data into useful information for planning, controlling, and decision-making.'
    },
    {
      id: 'ch13-q06',
      question: 'A transaction processing system (TPS) handles:',
      options: [
        { text: 'Strategic long-term planning', correct: false },
        { text: 'Routine, day-to-day business transactions like sales and payroll', correct: true },
        { text: 'Executive decision-making only', correct: false },
        { text: 'Product design', correct: false }
      ],
      explanation: 'The correct answer is "Routine, day-to-day business transactions like sales and payroll." TPS captures and processes the fundamental transactions that keep a business running.'
    }
  ]);

  writeQuiz(13, '13.4', [
    {
      id: 'ch13-q07',
      question: 'Big data refers to:',
      options: [
        { text: 'Only data stored on large computers', correct: false },
        { text: 'Extremely large and complex datasets that require advanced tools to analyze', correct: true },
        { text: 'Data that has been deleted', correct: false },
        { text: 'Simple spreadsheet data', correct: false }
      ],
      explanation: 'The correct answer is "Extremely large and complex datasets that require advanced tools to analyze." Big data is characterized by volume, velocity, and variety.'
    },
    {
      id: 'ch13-q08',
      question: 'A data warehouse is:',
      options: [
        { text: 'A physical building that stores computer servers', correct: false },
        { text: 'A central repository that consolidates data from multiple sources for analysis', correct: true },
        { text: 'A backup drive for individual computers', correct: false },
        { text: 'A type of antivirus software', correct: false }
      ],
      explanation: 'The correct answer is "A central repository that consolidates data from multiple sources for analysis." Data warehouses enable organizations to analyze historical trends and make data-driven decisions.'
    }
  ]);

  writeQuiz(13, '13.5', [
    {
      id: 'ch13-q09',
      question: 'Cybersecurity threats include all of the following EXCEPT:',
      options: [
        { text: 'Phishing attacks', correct: false },
        { text: 'Ransomware', correct: false },
        { text: 'Data encryption for protection', correct: true },
        { text: 'Malware infections', correct: false }
      ],
      explanation: 'The correct answer is "Data encryption for protection." Encryption is a security measure, not a threat. Phishing, ransomware, and malware are all cybersecurity threats.'
    },
    {
      id: 'ch13-q10',
      question: 'A firewall protects a network by:',
      options: [
        { text: 'Speeding up internet connections', correct: false },
        { text: 'Monitoring and controlling incoming and outgoing network traffic based on security rules', correct: true },
        { text: 'Storing backup copies of files', correct: false },
        { text: 'Creating user passwords', correct: false }
      ],
      explanation: 'The correct answer is "Monitoring and controlling incoming and outgoing network traffic based on security rules." Firewalls act as a barrier between trusted internal networks and untrusted external networks.'
    }
  ]);

  writeQuiz(13, '13.6', [
    {
      id: 'ch13-q11',
      question: 'Artificial intelligence (AI) in business is used for:',
      options: [
        { text: 'Only replacing all human workers', correct: false },
        { text: 'Automating tasks, analyzing data patterns, and improving decision-making', correct: true },
        { text: 'Only playing games', correct: false },
        { text: 'Reducing computer speed', correct: false }
      ],
      explanation: 'The correct answer is "Automating tasks, analyzing data patterns, and improving decision-making." AI helps businesses process information, identify trends, and automate routine tasks more efficiently.'
    },
    {
      id: 'ch13-q12',
      question: 'The Internet of Things (IoT) connects:',
      options: [
        { text: 'Only smartphones to the internet', correct: false },
        { text: 'Physical devices and objects to the internet, allowing them to collect and share data', correct: true },
        { text: 'Only computers in an office', correct: false },
        { text: 'Social media accounts to email', correct: false }
      ],
      explanation: 'The correct answer is "Physical devices and objects to the internet, allowing them to collect and share data." IoT enables smart devices, sensors, and equipment to communicate and share information.'
    }
  ]);

  console.log('Chapter 14:');

  writeQuiz(14, '14.2', [
    {
      id: 'ch14-q03',
      question: 'Managerial accounting provides information primarily for:',
      options: [
        { text: 'External investors and regulators', correct: false },
        { text: 'Internal managers to help with planning and decision-making', correct: true },
        { text: 'Tax authorities only', correct: false },
        { text: 'The general public', correct: false }
      ],
      explanation: 'The correct answer is "Internal managers to help with planning and decision-making." Unlike financial accounting (for external users), managerial accounting serves internal decision-makers.'
    },
    {
      id: 'ch14-q04',
      question: 'Financial accounting reports are primarily used by:',
      options: [
        { text: 'Only company employees', correct: false },
        { text: 'External stakeholders such as investors, creditors, and regulators', correct: true },
        { text: 'Only the CEO', correct: false },
        { text: 'Only government agencies', correct: false }
      ],
      explanation: 'The correct answer is "External stakeholders such as investors, creditors, and regulators." Financial accounting follows standardized rules (GAAP) to provide comparable information for external users.'
    }
  ]);

  writeQuiz(14, '14.3', [
    {
      id: 'ch14-q05',
      question: 'Generally Accepted Accounting Principles (GAAP) ensure that:',
      options: [
        { text: 'Companies can report finances however they choose', correct: false },
        { text: 'Financial statements are prepared consistently and comparably across companies', correct: true },
        { text: 'Only large companies need to keep financial records', correct: false },
        { text: 'Taxes are automatically calculated', correct: false }
      ],
      explanation: 'The correct answer is "Financial statements are prepared consistently and comparably across companies." GAAP provides the standardized framework that makes financial reporting reliable and comparable.'
    },
    {
      id: 'ch14-q06',
      question: 'The accounting equation is:',
      options: [
        { text: 'Revenue - Expenses = Profit', correct: false },
        { text: 'Assets = Liabilities + Owners\' Equity', correct: true },
        { text: 'Cash In - Cash Out = Balance', correct: false },
        { text: 'Sales x Price = Revenue', correct: false }
      ],
      explanation: 'The correct answer is "Assets = Liabilities + Owners\' Equity." This fundamental equation is the foundation of double-entry bookkeeping and the balance sheet.'
    }
  ]);

  writeQuiz(14, '14.4', [
    {
      id: 'ch14-q07',
      question: 'The balance sheet shows:',
      options: [
        { text: 'Revenue and expenses over a period of time', correct: false },
        { text: 'A snapshot of assets, liabilities, and equity at a specific point in time', correct: true },
        { text: 'Cash inflows and outflows', correct: false },
        { text: 'Only the company\'s debts', correct: false }
      ],
      explanation: 'The correct answer is "A snapshot of assets, liabilities, and equity at a specific point in time." The balance sheet reflects the accounting equation: Assets = Liabilities + Owners\' Equity.'
    },
    {
      id: 'ch14-q08',
      question: 'Current assets differ from fixed assets in that current assets:',
      options: [
        { text: 'Are worth more money', correct: false },
        { text: 'Can be converted to cash within one year', correct: true },
        { text: 'Never change in value', correct: false },
        { text: 'Include buildings and land', correct: false }
      ],
      explanation: 'The correct answer is "Can be converted to cash within one year." Current assets (cash, accounts receivable, inventory) are liquid, while fixed assets (equipment, buildings) are long-term.'
    }
  ]);

  writeQuiz(14, '14.5', [
    {
      id: 'ch14-q09',
      question: 'The income statement shows:',
      options: [
        { text: 'What the company owns and owes', correct: false },
        { text: 'Revenue, expenses, and profit or loss over a period of time', correct: true },
        { text: 'Only cash transactions', correct: false },
        { text: 'The company\'s stock price', correct: false }
      ],
      explanation: 'The correct answer is "Revenue, expenses, and profit or loss over a period of time." The income statement (profit and loss statement) summarizes financial performance over a specific period.'
    },
    {
      id: 'ch14-q10',
      question: 'Net income is calculated as:',
      options: [
        { text: 'Total assets minus total liabilities', correct: false },
        { text: 'Total revenue minus total expenses', correct: true },
        { text: 'Cash in minus cash out', correct: false },
        { text: 'Sales price times quantity sold', correct: false }
      ],
      explanation: 'The correct answer is "Total revenue minus total expenses." Net income (or net profit) is the bottom line that shows what remains after all expenses are subtracted from revenue.'
    }
  ]);

  writeQuiz(14, '14.6', [
    {
      id: 'ch14-q11',
      question: 'The statement of cash flows tracks:',
      options: [
        { text: 'Only sales revenue', correct: false },
        { text: 'Cash inflows and outflows from operating, investing, and financing activities', correct: true },
        { text: 'Only bank account balances', correct: false },
        { text: 'Employee salaries only', correct: false }
      ],
      explanation: 'The correct answer is "Cash inflows and outflows from operating, investing, and financing activities." The cash flow statement shows how cash moves through the business in three categories.'
    },
    {
      id: 'ch14-q12',
      question: 'Operating activities on the cash flow statement include:',
      options: [
        { text: 'Buying equipment and buildings', correct: false },
        { text: 'Cash received from customers and cash paid to suppliers and employees', correct: true },
        { text: 'Issuing stock or bonds', correct: false },
        { text: 'Paying dividends to shareholders', correct: false }
      ],
      explanation: 'The correct answer is "Cash received from customers and cash paid to suppliers and employees." Operating activities represent the cash flows from the company\'s core business operations.'
    }
  ]);

  writeQuiz(14, '14.7', [
    {
      id: 'ch14-q13',
      question: 'Financial ratio analysis is used to:',
      options: [
        { text: 'Replace financial statements entirely', correct: false },
        { text: 'Evaluate a company\'s financial performance and health by comparing key numbers', correct: true },
        { text: 'Calculate employee bonuses', correct: false },
        { text: 'Set product prices', correct: false }
      ],
      explanation: 'The correct answer is "Evaluate a company\'s financial performance and health by comparing key numbers." Ratios provide quick insights into liquidity, profitability, and efficiency.'
    },
    {
      id: 'ch14-q14',
      question: 'The current ratio measures:',
      options: [
        { text: 'How profitable a company is', correct: false },
        { text: 'A company\'s ability to pay short-term obligations with current assets', correct: true },
        { text: 'How fast inventory sells', correct: false },
        { text: 'Total revenue growth', correct: false }
      ],
      explanation: 'The correct answer is "A company\'s ability to pay short-term obligations with current assets." The current ratio (current assets ÷ current liabilities) is a key measure of liquidity.'
    }
  ]);

  writeQuiz(14, '14.8', [
    {
      id: 'ch14-q15',
      question: 'An independent audit of financial statements is important because it:',
      options: [
        { text: 'Guarantees the company will be profitable', correct: false },
        { text: 'Provides an objective opinion on whether the statements are fairly presented', correct: true },
        { text: 'Eliminates all accounting errors', correct: false },
        { text: 'Is only required for small businesses', correct: false }
      ],
      explanation: 'The correct answer is "Provides an objective opinion on whether the statements are fairly presented." Independent auditors verify that financial statements comply with GAAP and are free of material misstatement.'
    },
    {
      id: 'ch14-q16',
      question: 'The Sarbanes-Oxley Act was enacted to:',
      options: [
        { text: 'Reduce corporate taxes', correct: false },
        { text: 'Strengthen corporate governance and financial reporting accountability', correct: true },
        { text: 'Eliminate the need for auditors', correct: false },
        { text: 'Allow companies to set their own accounting rules', correct: false }
      ],
      explanation: 'The correct answer is "Strengthen corporate governance and financial reporting accountability." SOX was passed after scandals like Enron and WorldCom to protect investors through improved financial disclosures.'
    }
  ]);

  console.log('Chapter 15:');

  writeQuiz(15, '15.1', [
    {
      id: 'ch15-q01',
      question: 'The primary goal of financial management is to:',
      options: [
        { text: 'Minimize all spending', correct: false },
        { text: 'Maximize the value of the firm for its owners', correct: true },
        { text: 'Avoid all debt', correct: false },
        { text: 'Keep the most cash on hand possible', correct: false }
      ],
      explanation: 'The correct answer is "Maximize the value of the firm for its owners." Financial managers make decisions about raising and using money to increase the company\'s overall value.'
    },
    {
      id: 'ch15-q02',
      question: 'The three key financial management activities are:',
      options: [
        { text: 'Hiring, firing, and training', correct: false },
        { text: 'Financial planning, investment decisions, and financing decisions', correct: true },
        { text: 'Marketing, sales, and production', correct: false },
        { text: 'Accounting, auditing, and tax preparation', correct: false }
      ],
      explanation: 'The correct answer is "Financial planning, investment decisions, and financing decisions." These three activities form the core of what financial managers do.'
    }
  ]);

  writeQuiz(15, '15.2', [
    {
      id: 'ch15-q03',
      question: 'A financial plan or budget helps a company by:',
      options: [
        { text: 'Eliminating all expenses', correct: false },
        { text: 'Forecasting revenue, expenses, and cash needs to guide decision-making', correct: true },
        { text: 'Guaranteeing profits', correct: false },
        { text: 'Replacing the need for accounting', correct: false }
      ],
      explanation: 'The correct answer is "Forecasting revenue, expenses, and cash needs to guide decision-making." Financial planning creates a roadmap for how a company will fund operations and growth.'
    },
    {
      id: 'ch15-q04',
      question: 'A cash budget tracks:',
      options: [
        { text: 'Only major purchases', correct: false },
        { text: 'Expected cash inflows and outflows over a specific period', correct: true },
        { text: 'Employee salaries only', correct: false },
        { text: 'Stock market performance', correct: false }
      ],
      explanation: 'The correct answer is "Expected cash inflows and outflows over a specific period." Cash budgets help managers ensure the company has enough cash to meet its obligations.'
    }
  ]);

  writeQuiz(15, '15.3', [
    {
      id: 'ch15-q05',
      question: 'Short-term financing is typically used for:',
      options: [
        { text: 'Building new factories', correct: false },
        { text: 'Meeting day-to-day operating expenses and seasonal needs', correct: true },
        { text: 'Acquiring other companies', correct: false },
        { text: 'Paying for 30-year mortgages', correct: false }
      ],
      explanation: 'The correct answer is "Meeting day-to-day operating expenses and seasonal needs." Short-term financing (under one year) covers working capital needs like inventory and payroll.'
    },
    {
      id: 'ch15-q06',
      question: 'Trade credit is a form of short-term financing where:',
      options: [
        { text: 'A bank provides a loan', correct: false },
        { text: 'Suppliers allow a company to buy goods now and pay later', correct: true },
        { text: 'Customers pay in advance', correct: false },
        { text: 'The company issues stock', correct: false }
      ],
      explanation: 'The correct answer is "Suppliers allow a company to buy goods now and pay later." Trade credit is one of the most common forms of short-term financing for businesses.'
    }
  ]);

  writeQuiz(15, '15.4', [
    {
      id: 'ch15-q07',
      question: 'Long-term financing is used for:',
      options: [
        { text: 'Paying monthly utility bills', correct: false },
        { text: 'Major investments like equipment, facilities, and expansion', correct: true },
        { text: 'Covering payroll for one month', correct: false },
        { text: 'Buying office supplies', correct: false }
      ],
      explanation: 'The correct answer is "Major investments like equipment, facilities, and expansion." Long-term financing (more than one year) funds capital expenditures and strategic growth initiatives.'
    },
    {
      id: 'ch15-q08',
      question: 'A corporate bond is:',
      options: [
        { text: 'A share of ownership in a company', correct: false },
        { text: 'A debt instrument where the company borrows money and promises to repay with interest', correct: true },
        { text: 'A government tax document', correct: false },
        { text: 'An employee benefit', correct: false }
      ],
      explanation: 'The correct answer is "A debt instrument where the company borrows money and promises to repay with interest." Bonds are a common form of long-term debt financing for corporations.'
    }
  ]);

  writeQuiz(15, '15.5', [
    {
      id: 'ch15-q09',
      question: 'Working capital is calculated as:',
      options: [
        { text: 'Total revenue minus total expenses', correct: false },
        { text: 'Current assets minus current liabilities', correct: true },
        { text: 'Total assets minus total liabilities', correct: false },
        { text: 'Cash on hand only', correct: false }
      ],
      explanation: 'The correct answer is "Current assets minus current liabilities." Working capital measures a company\'s short-term financial health and its ability to cover day-to-day obligations.'
    },
    {
      id: 'ch15-q10',
      question: 'Effective cash management involves:',
      options: [
        { text: 'Keeping all money in a savings account', correct: false },
        { text: 'Speeding up cash collections and managing disbursements strategically', correct: true },
        { text: 'Spending cash as quickly as possible', correct: false },
        { text: 'Avoiding all investments', correct: false }
      ],
      explanation: 'The correct answer is "Speeding up cash collections and managing disbursements strategically." Good cash management ensures the company has enough liquidity while maximizing the use of available funds.'
    }
  ]);

  writeQuiz(15, '15.6', [
    {
      id: 'ch15-q11',
      question: 'The time value of money principle states that:',
      options: [
        { text: 'Money loses all value over time', correct: false },
        { text: 'A dollar today is worth more than a dollar in the future', correct: true },
        { text: 'Future money is always worth more than present money', correct: false },
        { text: 'Inflation has no effect on money', correct: false }
      ],
      explanation: 'The correct answer is "A dollar today is worth more than a dollar in the future." Due to the potential to earn interest or returns, money available now has greater value than the same amount received later.'
    },
    {
      id: 'ch15-q12',
      question: 'Capital budgeting helps managers:',
      options: [
        { text: 'Set employee salaries', correct: false },
        { text: 'Evaluate and select long-term investment projects', correct: true },
        { text: 'Create marketing campaigns', correct: false },
        { text: 'Hire new employees', correct: false }
      ],
      explanation: 'The correct answer is "Evaluate and select long-term investment projects." Capital budgeting uses techniques like NPV and IRR to determine which major investments will create the most value.'
    }
  ]);
}

fixChapter13to15();

console.log('\n✅ All quiz files fixed!');
console.log('Total files updated: ~75');
