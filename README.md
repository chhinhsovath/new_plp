# Primary Learning Platform (PLP) - Modern Stack

A modern web application migration of the Primary Learning Platform from PHP to React/Node.js stack.

## Architecture

This is a monorepo project using:
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Real-time**: Socket.io
- **File Storage**: AWS S3
- **Monorepo**: Turborepo with pnpm workspaces

## Project Structure

```
.
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express backend API
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configuration
│   └── types/        # Shared TypeScript types
└── RESOURCES/        # Migration documentation and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis (optional, for caching)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. Set up the database:
   ```bash
   pnpm -F @plp/database db:push
   pnpm -F @plp/database db:seed
   ```

5. Start the development servers:
   ```bash
   pnpm dev
   ```

The frontend will be available at http://localhost:3000 and the API at http://localhost:4000.

## Development

### Commands

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Run linting
- `pnpm test` - Run tests
- `pnpm typecheck` - Run TypeScript type checking

### Database

- `pnpm -F @plp/database db:studio` - Open Prisma Studio
- `pnpm -F @plp/database db:migrate` - Run migrations
- `pnpm -F @plp/database db:seed` - Seed the database

## Features

### Implemented
- ✅ Modern monorepo structure
- ✅ Next.js frontend with TypeScript
- ✅ Express API with TypeScript
- ✅ PostgreSQL database with Prisma
- ✅ Basic authentication setup
- ✅ API route structure
- ✅ Database schema

### In Progress
- 🚧 40+ exercise type components
- 🚧 Payment integration (PayWay, Wing Money)
- 🚧 File upload system
- 🚧 Real-time features
- 🚧 Testing framework

### Planned
- 📋 Complete exercise library
- 📋 Forum functionality
- 📋 Analytics dashboard
- 📋 Mobile responsiveness
- 📋 Offline support

## Migration Status

Based on the feasibility report, we expect:
- **85-90%** feature parity with the original PHP application
- **3-5x** performance improvement
- **10x** better scalability
- Modern security standards

## Deployment

The application is designed to be deployed on:
- Frontend: Vercel
- Backend: AWS ECS / Google Cloud Run
- Database: AWS RDS / Google Cloud SQL
- Files: AWS S3
- CDN: CloudFront

## Contributing

Please read the migration documentation in the RESOURCES folder before contributing.

## License

Proprietary - Ministry of Education, Youth and Sport (MoEYS), Cambodia