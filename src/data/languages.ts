import { Language, Course, Lesson, Exercise, Challenge, Achievement } from '@/types';

export const languages: Language[] = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    description: 'Perfect for beginners. Powerful and versatile for data science, AI, and web development.',
    difficulty: 'beginner',
    topics: ['Variables', 'Data Types', 'Control Flow', 'Functions', 'OOP', 'Libraries']
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '⚡',
    description: 'The language of the web. Essential for frontend and backend development.',
    difficulty: 'beginner',
    topics: ['Variables', 'Functions', 'DOM', 'Async', 'ES6+', 'Node.js']
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    description: 'Enterprise-grade language. Great for large-scale applications and Android development.',
    difficulty: 'intermediate',
    topics: ['OOP', 'Collections', 'Streams', 'Multithreading', 'Spring']
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '⚙️',
    description: 'High-performance language. Used in game development, systems programming, and competitive programming.',
    difficulty: 'advanced',
    topics: ['Pointers', 'Memory', 'OOP', 'STL', 'Templates']
  },
  {
    id: 'c',
    name: 'C',
    icon: '🔧',
    description: 'The foundation of modern programming. Low-level control and maximum performance.',
    difficulty: 'advanced',
    topics: ['Pointers', 'Memory', 'Structs', 'File I/O', 'Preprocessor']
  },
  {
    id: 'csharp',
    name: 'C#',
    icon: '🎮',
    description: 'Microsoft ecosystem language. Perfect for Unity game development and .NET applications.',
    difficulty: 'intermediate',
    topics: ['OOP', 'LINQ', 'Async', '.NET', 'Unity']
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '📘',
    description: 'Typed JavaScript. Safer code with better tooling for large applications.',
    difficulty: 'intermediate',
    topics: ['Types', 'Interfaces', 'Generics', 'Decorators', 'React']
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: '🗄️',
    description: 'Database language. Essential for managing and querying relational databases.',
    difficulty: 'beginner',
    topics: ['SELECT', 'JOIN', 'Aggregation', 'Subqueries', 'Indexes']
  },
  {
    id: 'html',
    name: 'HTML',
    icon: '🌐',
    description: 'The structure of the web. Every web page starts with HTML.',
    difficulty: 'beginner',
    topics: ['Elements', 'Forms', 'Semantic', 'Accessibility']
  },
  {
    id: 'css',
    name: 'CSS',
    icon: '🎨',
    description: 'Style the web. Create beautiful, responsive designs.',
    difficulty: 'beginner',
    topics: ['Selectors', 'Flexbox', 'Grid', 'Animations', 'Responsive']
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🐹',
    description: 'Simple and fast. Perfect for cloud services and microservices.',
    difficulty: 'intermediate',
    topics: ['Goroutines', 'Channels', 'Interfaces', 'Modules', 'Web']
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '🦀',
    description: 'Memory-safe systems programming. Modern, fast, and reliable.',
    difficulty: 'advanced',
    topics: ['Ownership', 'Borrowing', 'Traits', 'Async', 'WebAssembly']
  },
  {
    id: 'php',
    name: 'PHP',
    icon: '🐘',
    description: 'Server-side scripting. Powers WordPress and many web applications.',
    difficulty: 'beginner',
    topics: ['Variables', 'Arrays', 'OOP', 'Databases', 'Frameworks']
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    description: 'Elegant and expressive. Famous for Ruby on Rails web framework.',
    difficulty: 'beginner',
    topics: ['Syntax', 'OOP', 'Blocks', 'Rails', 'Testing']
  },
  {
    id: 'swift',
    name: 'Swift',
    icon: '🍎',
    description: 'Apple ecosystem language. Build iOS, macOS, and watchOS apps.',
    difficulty: 'intermediate',
    topics: ['Optionals', 'Closures', 'Protocols', 'SwiftUI', 'Combine']
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    icon: '🤖',
    description: 'Modern Android development. Concise, safe, and interoperable with Java.',
    difficulty: 'intermediate',
    topics: ['Null Safety', 'Coroutines', 'Classes', 'Android', 'Compose']
  },
  {
    id: 'r',
    name: 'R',
    icon: '📊',
    description: 'Statistical computing. Essential for data analysis and visualization.',
    difficulty: 'intermediate',
    topics: ['Data Frames', 'Visualization', 'Statistics', 'Packages', 'ML']
  },
  {
    id: 'dart',
    name: 'Dart',
    icon: '🎯',
    description: 'Flutter language. Build beautiful cross-platform apps.',
    difficulty: 'intermediate',
    topics: ['Async', 'Classes', 'Flutter', 'Widgets', 'State']
  },
  {
    id: 'bash',
    name: 'Bash',
    icon: '💻',
    description: 'Command line scripting. Automate tasks and manage systems.',
    difficulty: 'beginner',
    topics: ['Commands', 'Variables', 'Loops', 'Functions', 'Pipelines']
  }
];

export const achievements: Achievement[] = [
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    requirement: 'Complete 1 lesson',
    xpReward: 50
  },
  {
    id: 'code_warrior',
    title: 'Code Warrior',
    description: 'Complete 10 lessons',
    icon: '⚔️',
    requirement: 'Complete 10 lessons',
    xpReward: 200
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    requirement: '7-day streak',
    xpReward: 300
  },
  {
    id: 'challenge_champion',
    title: 'Challenge Champion',
    description: 'Solve 50 coding challenges',
    icon: '🏆',
    requirement: 'Solve 50 challenges',
    xpReward: 500
  },
  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Learn 3 different programming languages',
    icon: '🌍',
    requirement: 'Complete lessons in 3 languages',
    xpReward: 400
  },
  {
    id: 'speed_coder',
    title: 'Speed Coder',
    description: 'Complete a challenge in under 30 seconds',
    icon: '⚡',
    requirement: 'Fast challenge completion',
    xpReward: 150
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on a course assessment',
    icon: '💯',
    requirement: 'Perfect assessment score',
    xpReward: 250
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a lesson after midnight',
    icon: '🦉',
    requirement: 'Late night learning',
    xpReward: 100
  }
];
