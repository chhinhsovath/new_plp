# Primary Learning Platform (PLP) - Developer Guide

This document provides essential information for AI assistants and developers working on the PLP project.

## Common Commands

### Development
```bash
# Start all services (web + api)
pnpm dev

# Start specific services
pnpm dev:web    # Frontend only (Next.js)
pnpm dev:api    # Backend only (Express)

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
pnpm test:e2e
```

### Database Management
```bash
# Push schema changes to database
pnpm db:push

# Seed database with initial data
pnpm db:seed

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Git Hooks (automatic)
- Pre-commit: Runs ESLint and Prettier on staged files
- Commit messages: Must follow conventional commit format

## Database Schema Overview

### Core Models

#### User System
- **User**: Central auth model with Clerk integration
  - Roles: STUDENT, PARENT, TEACHER, ADMIN
  - Bilingual support (English/Khmer)
  - Parent-child relationships

#### Educational Content
- **Subject**: Academic subjects (math, khmer, english, science)
- **Lesson**: Grade-specific lessons per subject
- **Exercise**: 18 types, 3 difficulty levels
  - Multiple choice, fill-in-blank, matching, etc.
  - JSON-based content storage

#### Progress Tracking
- **Progress**: User progress per lesson
- **ExerciseAttempt**: Individual attempt records
  - Tracks score, time spent, correctness

#### Community Features
- **ForumPost**: Subject-tagged discussions
- **ForumAnswer**: Replies with acceptance mechanism
- **SavedPost**: Bookmarking system

#### Payment & Notifications
- **Payment**: Supports USD/KHR, Stripe integration
- **Notification**: 9 types with preference controls

### Key Relationships
- User → StudentProfile/TeacherProfile (1:1)
- Subject → Lessons → Exercises (1:N)
- User → Progress → ExerciseAttempts (1:N)
- ForumPost → ForumAnswers (1:N, cascade delete)

## API Structure

### Base URL: `/api`

### Authentication
- Uses Clerk for authentication
- Middleware: `authenticate()` and `authorize(roles)`
- All routes except public ones require authentication

### Main Routes

#### Public Routes
- `GET /api/subjects` - List all subjects

#### Authenticated Routes

**User Management**
- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/children` - Parent's children
- `POST /api/users/children` - Add child

**Learning Content**
- `GET /api/subjects/:id` - Subject with lessons
- `GET /api/exercises/:subject/:type` - Filtered exercises
- `POST /api/exercises/:id/submit` - Submit answer
- `GET /api/exercises/:id/solution` - View solution

**Progress Tracking**
- `GET /api/progress` - Overall progress
- `GET /api/progress/:subject` - Subject progress

**Forum**
- `GET /api/forum/posts` - List posts
- `POST /api/forum/posts` - Create post
- `POST /api/forum/posts/:id/answers` - Reply to post

**Payments**
- `POST /api/payments/create-intent` - Start payment
- `POST /api/payments/confirm/:id` - Confirm payment
- Supports: ABA PayWay, Wing Money

**Admin Routes** (require ADMIN role)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/content/exercises` - Content management

### Real-time Features (Socket.io)
- Room-based exercise collaboration
- Real-time notifications
- Online user tracking
- Multi-device support

### Error Handling
- Custom `AppError` class
- Zod validation with automatic error responses
- Consistent error format: `{ error: { message, code? } }`

## Key Business Logic

### User Types & Permissions

1. **Students**
   - Access grade-appropriate content
   - Track personal progress
   - Participate in forums

2. **Parents**
   - Monitor child progress
   - Manage child accounts
   - Control child settings

3. **Teachers**
   - Access all educational content
   - View class statistics
   - Moderate forums

4. **Admins**
   - Full system access
   - User management
   - Content management
   - Financial reports

### Learning Flow

1. **Content Structure**
   ```
   Subject (e.g., Math)
   └── Lessons (Grade-specific)
       └── Exercises (Various types)
           └── Attempts (User submissions)
   ```

2. **Progress Calculation**
   - Lesson completion: All exercises attempted
   - Score: Average of best attempts
   - Streaks: Consecutive daily activity

3. **Exercise Types** (18 total)
   - Multiple choice
   - Fill in blanks
   - Matching
   - True/false
   - Drag and drop
   - Drawing
   - Voice recording
   - And more...

### Payment System
- Subscription-based model
- Local payment integration (Cambodia)
- Multi-currency support (USD/KHR)
- Stripe for card payments
- Local providers for mobile money

### Notification System
- 9 notification types
- Multi-channel delivery (email, push, in-app)
- User preference controls
- Real-time via Socket.io

## Tech Stack Summary

### Frontend
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS + Radix UI
- Clerk authentication
- TanStack Query
- Zustand state management

### Backend
- Express.js with TypeScript
- Prisma ORM
- PostgreSQL database
- Socket.io for real-time
- Zod validation

### Infrastructure
- pnpm workspaces
- Turbo monorepo
- Husky + lint-staged
- ESLint + Prettier

## Important Notes

1. **Bilingual Support**: All content supports Khmer/English
2. **Mobile-First**: Optimized for mobile devices
3. **Offline Support**: Key features work offline
4. **Accessibility**: WCAG 2.1 AA compliance target
5. **Performance**: Lazy loading, code splitting
6. **Security**: OWASP best practices

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Getting Help

- Check TypeScript errors first
- Run `pnpm typecheck` before commits
- Use `pnpm db:studio` to inspect database
- Socket.io events visible in browser DevTools