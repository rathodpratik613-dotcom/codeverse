# CODEVERSE Migration Audit - NoSQL Edition

## Current Data Storage Locations

### 1. Content Data (JSON Files) - DO NOT MODIFY
**Location:** `/content/languages/`

**Languages Found:** 1 (Python only)
- `python/language.json` - Language metadata
- `python/courses/python-basics/` - Course structure
  - `course.json` - Course metadata
  - `modules/01-introduction/` - First module
    - `module.json` - Module metadata
    - `lessons/` - 3 lesson JSON files
    - `quizzes/` - 1 quiz JSON file
    - `challenges/` - 1 challenge JSON file
    - `debug/` - 1 debug challenge JSON file
    - `puzzles/` - 1 puzzle JSON file

**Content Types:**
- Languages: 1
- Courses: 1
- Modules: 1
- Lessons: 3
- Quizzes: 1
- Challenges: 1
- Debug Challenges: 1
- Puzzles: 1
- Projects: 0
- Missions: 0
- Achievements: 0
- Glossary Terms: 0
- Cheat Sheets: 0
- Interview Questions: 0

### 2. Hardcoded Data (TypeScript)
**Location:** `/src/data/`

**Files:**
- `languages.ts` - 19 language definitions (hardcoded)
- `courses.ts` - Python and JavaScript course data (hardcoded)

**Content:**
- Languages: 19 (Python, JavaScript, Java, C++, C, C#, TypeScript, SQL, HTML, CSS, Go, Rust, PHP, Ruby, Swift, Kotlin, R, Dart, Bash)
- Courses: 2 (Python Fundamentals, JavaScript Basics)
- Lessons: 8 total (6 Python, 2 JavaScript)
- Exercises: Multiple per lesson

### 3. Student Data Storage (MongoDB)

**Collections Created:**
- `users` - User accounts with XP, coins, streaks, preferences
- `sessions` - Active login sessions with httpOnly cookies
- `lessonProgress` - Lesson/quiz/challenge completion status
- `editorDrafts` - Auto-saved code per lesson/challenge
- `challengeSubmissions` - Code submissions with results
- `xpTransactions` - XP award history (idempotent)
- `coinTransactions` - Coin award history (idempotent)
- `userAchievements` - Unlocked achievements
- `bookmarks` - User bookmarks for lessons/challenges
- `notes` - Personal notes per content
- `activityLog` - Recent activity tracking
- `notifications` - In-app notifications

**Key Features:**
- Unique compound index on `(userId, sourceType, sourceId)` for idempotent rewards
- Indexes on `userId` and `(userId, contentId)` for fast lookups
- Unique indexes on `email` and `username`
- TTL index on sessions for automatic expiry

### 4. API Routes (Server-side)
**Location:** `/src/app/api/`

**Endpoints:**
- `/api/auth/signup` - User registration with session creation
- `/api/auth/login` - User login with session creation
- `/api/auth/logout` - Session termination
- `/api/auth/me` - Current user data
- `/api/progress` - Lesson progress tracking
- `/api/drafts` - Editor draft autosave
- `/api/submissions` - Challenge submissions
- `/api/bookmarks` - Bookmark management
- `/api/xp` - XP and coin transactions
- `/api/users/[id]` - User management
- `/api/execute` - Code execution

### 5. Environment Variables Required
```env
MONGODB_URI=mongodb://admin:password@localhost:27017/codeverse?authSource=admin
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## Migration Status

### Completed:
- ✅ MongoDB connection setup (`src/lib/db.ts`)
- ✅ Mongoose models for all student data collections
- ✅ JWT + httpOnly cookie session management
- ✅ Auth context with MongoDB backend
- ✅ API routes for all student data operations
- ✅ Idempotent XP/coin transaction system
- ✅ Docker Compose for local MongoDB
- ✅ Environment configuration

### Pending:
- ⏳ Frontend integration with new auth system
- ⏳ Guest mode implementation
- ⏳ Offline sync queue
- ⏳ Admin CRUD for content
- ⏳ Additional account features (email verification, password reset)
- ⏳ Extra features (certificates, streaks, etc.)

## Dataset Protection

**CRITICAL:** The `/content` directory and `/src/data/` files are the source of truth for learning content and MUST NOT be modified. All student data references content by existing IDs/slugs as plain strings.

## Next Steps

1. Update frontend components to use new auth context
2. Implement guest mode with localStorage merge
3. Add offline sync capabilities
4. Create admin panel for content management
5. Add account management features
6. Implement extra gamification features
