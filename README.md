# CODEVERSE - Learn Coding Through Gaming

A gamified programming education platform where beginners can learn programming languages from zero to advanced levels through interactive gameplay.

## 🎮 Features

### Core Features
- **19 Programming Languages**: Python, JavaScript, Java, C, C++, C#, TypeScript, SQL, HTML, CSS, Go, Rust, PHP, Ruby, Swift, Kotlin, R, Dart, Bash
- **Interactive Code Editor**: Monaco Editor integration with syntax highlighting
- **Real Code Execution**: JavaScript execution in browser (Python planned with Pyodide)
- **Gamification System**: XP, coins, levels, streaks, achievements, and leaderboards
- **Multiple Game Modes**:
  - Coding Adventure (progressive learning path)
  - Coding Battle (competitive challenges)
  - Debugging Arena (find and fix bugs)
  - Boss Challenges (advanced multi-step problems)

### Pages
- Landing page with premium gaming design
- User authentication (signup/login)
- User dashboard with progress tracking
- Language selection page
- Course pages with modules and lessons
- Interactive lesson pages with code editor
- Code playground
- Coding challenges
- Achievements and leaderboards
- User profile and settings
- Admin dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository (or navigate to the project directory):
```bash
cd C:\Users\ratho\Documents\codeverse
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations (installed, ready to use)
- **Monaco Editor** - Code editor
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication tokens

### Current Data Storage
- In-memory storage (users stored in RAM for development)
- Ready for database integration (PostgreSQL/Supabase recommended)

## 📁 Project Structure

```
codeverse/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   ├── execute/     # Code execution
│   │   │   └── users/       # User management
│   │   ├── admin/           # Admin dashboard
│   │   ├── achievements/    # Achievements page
│   │   ├── challenges/      # Coding challenges
│   │   ├── course/[id]/     # Course pages
│   │   ├── dashboard/       # User dashboard
│   │   ├── languages/       # Language selection
│   │   ├── lesson/[id]/     # Lesson pages with editor
│   │   ├── leaderboard/     # Global leaderboard
│   │   ├── login/           # Login page
│   │   ├── playground/      # Code playground
│   │   ├── profile/         # User profile
│   │   ├── settings/        # User settings
│   │   ├── signup/          # Signup page
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   └── globals.css      # Global styles
│   ├── components/          # Reusable components (ready for use)
│   ├── data/                # Static data
│   │   ├── courses.ts       # Course content
│   │   └── languages.ts     # Language info & achievements
│   ├── lib/                 # Utility functions
│   │   └── auth.ts          # Authentication logic
│   └── types/               # TypeScript types
│       └── index.ts         # Type definitions
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎯 What Works

### ✅ Fully Implemented
- Landing page with premium gaming design
- Signup and login pages (UI ready, API endpoints created)
- User dashboard with stats and progress
- Language selection with 19 languages
- Course pages with modules and lessons
- Lesson pages with Monaco code editor
- JavaScript code execution in browser
- Code playground with editor
- Challenges page (Battle, Debugging, Boss modes)
- Achievements page with unlock system
- Leaderboard page
- User profile page
- Settings page
- Admin dashboard
- Authentication API (signup, login)
- User management API
- XP and coin tracking system
- Gamification UI (levels, streaks, achievements)

### 🔧 Technical Implementation
- Monaco Editor integration for code editing
- Client-side JavaScript execution with eval()
- Password hashing with bcryptjs
- JWT token generation
- In-memory user storage (development mode)
- Responsive design with Tailwind CSS
- Dark theme with purple/blue gaming aesthetic

## ⚠️ Current Limitations

### Development Mode Only
- User data stored in memory (lost on server restart)
- No persistent database
- No session persistence across page reloads
- Authentication not fully connected to UI

### Code Execution
- JavaScript execution works in browser
- Python execution shows placeholder message (needs Pyodide integration)
- Other languages not yet implemented

### Missing Features
- Real database integration (PostgreSQL/Supabase)
- Session management with cookies
- Protected routes with authentication middleware
- Real-time leaderboard updates
- Code submission history
- Project mode with practical projects
- Daily missions system (UI ready, backend needed)
- Social features (friends, groups)

## 🗄️ Database Setup (Future)

To add persistent storage:

1. Install database client:
```bash
npm install pg @prisma/client
npm install -D prisma
```

2. Initialize Prisma:
```bash
npx prisma init
```

3. Define schema in `prisma/schema.prisma` based on types in `src/types/index.ts`

4. Run migrations:
```bash
npx prisma migrate dev
```

5. Update API routes to use database instead of in-memory storage

## 🔐 Environment Variables

Create a `.env.local` file:

```env
JWT_SECRET=your-secret-key-here
DATABASE_URL=your-database-connection-string
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## 📝 Development Notes

### Adding New Languages
1. Add language to `src/data/languages.ts`
2. Create course content in `src/data/courses.ts`
3. Update language selection page

### Adding New Lessons
1. Add lesson to appropriate course in `src/data/courses.ts`
2. Include content, code examples, and exercises
3. Set difficulty and XP rewards

### Customizing Theme
Edit `src/app/globals.css` to modify:
- Color variables
- Background gradients
- Font settings

## 🐛 Known Issues

- Server restart loses all user data (in-memory storage)
- Python execution not implemented (shows placeholder)
- Authentication not connected to UI components
- No real-time updates for leaderboard
- Some navigation links may not be fully connected

## 🎨 Design System

### Colors
- Background: Deep navy (#0a0e27)
- Primary: Purple (#8b5cf6)
- Secondary: Blue (#3b82f6)
- Accent: Cyan (#06b6d4)
- Card backgrounds: Semi-transparent overlays

### Typography
- Font: Geist Sans (primary), Geist Mono (code)
- Clean, modern, gaming-inspired

### Components
- Rounded corners (xl, 2xl)
- Gradient backgrounds
- Subtle borders
- Hover effects and transitions

## 🤝 Contributing

This is a demonstration project. To extend it:

1. Add database integration
2. Connect authentication to UI
3. Implement Python execution with Pyodide
4. Add more course content
5. Implement real-time features
6. Add social features

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Monaco Editor for the code editor
- Lucide for beautiful icons
- Tailwind CSS for styling

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
