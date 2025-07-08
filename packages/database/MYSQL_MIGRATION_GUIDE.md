# MySQL to PostgreSQL Migration Guide

## Current Setup

The application is currently configured to work with MySQL database with the following setup:

- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: root
- **Database**: new_plp

## Database Structure

To preserve existing data, we've created new tables with a `new_` prefix alongside your existing tables:

### New Tables (for the new application)
- `new_users` - User accounts with Clerk integration
- `new_student_profiles` - Student-specific data
- `new_teacher_profiles` - Teacher-specific data
- `new_subjects` - Subject definitions
- `new_lessons` - Lessons within subjects
- `new_exercises` - Exercise content
- `new_exercise_attempts` - Student exercise attempts
- `new_progress` - Student progress tracking
- `new_forum_posts` - Forum posts
- `new_forum_answers` - Forum answers
- `new_saved_posts` - Saved forum posts
- `new_payments` - Payment records
- `new_notifications` - User notifications
- `new_notification_preferences` - Notification settings

### Existing Tables (preserved)
All your existing tables starting with `tbl_` have been preserved and can be accessed for data migration.

## Data Migration Steps

When you're ready to migrate data from old tables to new ones:

1. **Create a migration script** in `packages/database/scripts/migrate-data.ts`
2. **Map old data to new structure**:
   - `tbl_users_register` → `new_users`
   - `tbl_child` → `new_users` (with STUDENT role)
   - `tbl_teacher_information` → `new_teacher_profiles`
   - `tbl_categories` → `new_subjects`/`new_lessons`
   - `tbl_exercise` → `new_exercises`
   - etc.

3. **Handle data transformations**:
   - Convert user roles to enum values
   - Map exercise types to new enum values
   - Convert JSON strings to proper JSON fields

## Future PostgreSQL Migration

When ready to migrate to PostgreSQL:

1. **Export MySQL data**:
   ```bash
   mysqldump -u root -p new_plp > backup.sql
   ```

2. **Update Prisma schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update connection string**:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/new_plp"
   ```

4. **Convert MySQL-specific syntax**:
   - Change `@db.Text` to PostgreSQL equivalents
   - Update any MySQL-specific functions in queries
   - Convert enums if needed

5. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

## Important Notes

- All new development uses the `new_` prefixed tables
- Old tables remain untouched for reference and gradual migration
- The application is fully functional with MySQL
- No immediate migration to PostgreSQL is required