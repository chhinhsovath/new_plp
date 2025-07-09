# PLP Project - Build and Run Guide

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **MySQL** database server
- **Git**

## Project Structure

```
new_plp/
├── apps/
│   ├── web/          # Next.js 14 Frontend
│   └── api/          # Express.js Backend
├── packages/
│   ├── database/     # Prisma Database Package
│   ├── types/        # Shared TypeScript Types
│   └── ui/           # Shared UI Components
└── turbo.json        # Turbo build configuration
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd new_plp

# Install all dependencies
pnpm install
```

### 2. Environment Setup

Create environment files for each app:

#### Database Environment (`.env`)
```bash
# Copy the database environment template
cp packages/database/.env.example packages/database/.env

# Edit the database configuration
# packages/database/.env
DATABASE_URL="mysql://root:123456@localhost:3306/new_plp"
```

#### Frontend Environment (`.env.local`)
```bash
# Create web app environment
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL="mysql://root:123456@localhost:3306/new_plp"
```

#### Backend Environment (`.env`)
```bash
# Create API environment
# apps/api/.env
DATABASE_URL="mysql://root:123456@localhost:3306/new_plp"
PORT=3001
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:push

# Seed the database with test data
pnpm db:seed

# (Optional) Open database studio
pnpm db:studio
```

### 4. Build and Run

Choose one of the following options:

#### Option A: Run Everything (Recommended)
```bash
# Run both frontend and backend simultaneously
pnpm dev
```

#### Option B: Run Individual Services
```bash
# Terminal 1: Run backend only
pnpm dev:api

# Terminal 2: Run frontend only
pnpm dev:web
```

#### Option C: Production Build
```bash
# Build all packages
pnpm build

# Start all services
pnpm start
```

## 🔧 Detailed Setup Instructions

### Database Configuration

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE new_plp;
   CREATE USER 'plp_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON new_plp.* TO 'plp_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Configure Database URL**
   ```bash
   # Format: mysql://username:password@host:port/database
   DATABASE_URL="mysql://plp_user:your_password@localhost:3306/new_plp"
   ```

3. **Run Database Operations**
   ```bash
   # Push schema to database
   pnpm db:push
   
   # Seed with test data
   pnpm db:seed
   
   # Verify data was seeded
   cd packages/database
   npx tsx scripts/verify-seed.ts
   ```

### Clerk Authentication Setup

1. **Create Clerk Account**
   - Go to [clerk.com](https://clerk.com)
   - Create a new application
   - Get your publishable key and secret key

2. **Configure Clerk Environment Variables**
   ```bash
   # In both apps/web/.env.local and apps/api/.env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

3. **Set up Clerk Webhooks** (Optional)
   - In Clerk dashboard, go to Webhooks
   - Add endpoint: `http://localhost:3001/api/webhook/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`

## 📱 Running the Applications

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Port**: 3000 (configurable in `apps/web/next.config.mjs`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Radix UI

### Backend (Express.js)
- **URL**: http://localhost:3001
- **Port**: 3001 (configurable in `apps/api/src/index.ts`)
- **Framework**: Express.js with TypeScript
- **Features**: REST API + Socket.io for real-time

### Database
- **Studio**: http://localhost:5555 (when running `pnpm db:studio`)
- **Type**: MySQL
- **ORM**: Prisma

## 🛠️ Development Commands

### Root Level Commands (from `/new_plp`)

```bash
# Development
pnpm dev              # Run all services
pnpm dev:web          # Run frontend only
pnpm dev:api          # Run backend only

# Building
pnpm build            # Build all packages
pnpm typecheck        # Check TypeScript types
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier

# Database
pnpm db:push          # Push schema changes
pnpm db:seed          # Seed database with test data
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # Run e2e tests
```

### Package-Specific Commands

```bash
# Frontend (apps/web)
cd apps/web
pnpm dev              # Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check

# Backend (apps/api)
cd apps/api
pnpm dev              # Express dev server with hot reload
pnpm build            # Build TypeScript to JavaScript
pnpm start            # Start production server
pnpm test             # Run API tests
pnpm test:coverage    # Test coverage

# Database (packages/database)
cd packages/database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema
pnpm db:seed          # Seed database
pnpm db:studio        # Prisma Studio
```

## 🎯 Test User Accounts

After seeding the database, you can use these test accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@plp.edu.kh | (Use Clerk) | System administrator |
| Teacher | sokha.teacher@plp.edu.kh | (Use Clerk) | Math & Science teacher |
| Teacher | dara.teacher@plp.edu.kh | (Use Clerk) | Khmer & Social Studies teacher |
| Parent | parent1@example.com | (Use Clerk) | Parent with 2 children |
| Student | virak.student@plp.edu.kh | (Use Clerk) | Grade 5 student |
| Student | sreymom.student@plp.edu.kh | (Use Clerk) | Grade 3 student |
| Student | kosal.student@plp.edu.kh | (Use Clerk) | Grade 6 student |

## 🔍 Accessing the Application

### Frontend Routes
- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Subjects**: http://localhost:3000/subjects
- **Videos**: http://localhost:3000/videos
- **Library**: http://localhost:3000/library
- **Forum**: http://localhost:3000/forum
- **Admin**: http://localhost:3000/admin

### API Endpoints
- **Base URL**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **API Documentation**: Check `/apps/api/src/routes/` for available endpoints

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check MySQL is running
   brew services start mysql  # macOS
   sudo systemctl start mysql # Linux
   
   # Verify connection
   mysql -u root -p
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

3. **Prisma Client Not Generated**
   ```bash
   # Regenerate Prisma client
   cd packages/database
   pnpm db:generate
   ```

4. **Dependencies Not Installing**
   ```bash
   # Clear cache and reinstall
   pnpm store prune
   rm -rf node_modules
   pnpm install
   ```

5. **TypeScript Errors**
   ```bash
   # Check types across all packages
   pnpm typecheck
   
   # Fix common issues
   pnpm db:generate  # Regenerate Prisma types
   ```

### Debug Mode

```bash
# Run with debug output
DEBUG=* pnpm dev

# API debug only
DEBUG=api:* pnpm dev:api

# Database debug
DEBUG=prisma:* pnpm dev
```

## 📊 Monitoring

### Development Tools
- **Prisma Studio**: http://localhost:5555
- **React Query Devtools**: Built into frontend
- **Socket.io Admin**: Available in browser console

### Logs
- **Frontend**: Browser console + Next.js terminal
- **Backend**: Console output with Morgan HTTP logging
- **Database**: Prisma query logging (in debug mode)

## 🚀 Production Deployment

### Build for Production
```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

### Environment Variables for Production
```bash
# Update these for production
NODE_ENV=production
DATABASE_URL="mysql://user:password@production-host:3306/plp_prod"
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## 📚 Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Clerk Documentation**: https://clerk.com/docs
- **Turbo Documentation**: https://turbo.build/repo/docs

## 🔧 Development Workflow

1. **Start Development Environment**
   ```bash
   pnpm dev
   ```

2. **Make Changes**
   - Frontend: Edit files in `apps/web/src/`
   - Backend: Edit files in `apps/api/src/`
   - Database: Edit `packages/database/prisma/schema.prisma`

3. **Test Changes**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

4. **Push Database Changes**
   ```bash
   pnpm db:push
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

The project is now ready for development! 🎉