# Database Migration Summary

## Overview
Successfully migrated all tables from the PRD database schema to the new_plp database.

## Table Categories

### 1. New System Tables (Prisma-managed)
These are the modern tables used by the new application:
- `new_users` - Unified user management with Clerk integration
- `new_subjects` - All 6 subjects including CALM and Social Studies
- `new_lessons` - Grade-specific lessons
- `new_exercises` - Modern exercise system with 18 types
- `new_videos` - Video content management
- `new_video_progress` - Video watching progress
- `new_library_resources` - Digital library
- `new_assessments` - EGRA and other assessments
- `new_forum_posts/answers` - Community forum
- `new_payments` - Payment tracking
- And more...

### 2. Legacy Tables (For Data Migration)
These tables are from the original system and can be used for data migration:

#### User Management
- `tbl_users_register` - Parent accounts
- `tbl_child` - Child accounts
- `tbl_user_admin` - Admin users

#### Educational Content
- `tbl_categories` - Content categories
- `tbl_exercise` - General exercises
- `tbl_english_exercise` - English exercises
- `tbl_khmer_exercise` - Khmer exercises
- `tbl_math_exercise` - Math exercises
- `tbl_science_exercise` - Science exercises
- `tbl_subjx1_exercise` - CALM exercises
- `tbl_subjx2_exercise` - Social Studies exercises

#### Answers
- `tbl_answer` - General answers
- `tbl_answer_english/khmer/math/science` - Subject-specific answers
- `tbl_answer_subjx1/subjx2` - Additional subject answers

#### Testing & Assessment
- `tbl_test_categories` - Test categories
- `tbl_test_exercise` - Test questions
- `tbl_test_user_answers` - User test responses
- `tbl_test_examinations_result` - Test results

#### School Management
- `tbl_school_list` - Schools directory
- `tbl_province/destrict/commune` - Location data

#### Other Features
- `tbl_forum_*` - Legacy forum tables
- `tbl_videos/video_lesson` - Legacy video system
- `tbl_book/ebook` - Digital library books
- `tbl_homework_task` - Homework system
- `tbl_payment_*` - Payment/subscription tables

### 3. Migration Mapping Tables
Special tables to track data migration:
- `migration_user_mapping` - Maps old user IDs to new user IDs
- `migration_exercise_mapping` - Maps old exercise IDs to new exercise IDs
- `migration_category_mapping` - Maps old categories to new subjects/lessons

## Total Tables Created
- **New System Tables**: 31 tables
- **Legacy Tables**: 55 tables
- **Migration Mapping Tables**: 3 tables
- **Total**: 89 tables

## Next Steps

1. **Data Migration Scripts**: Create scripts to migrate data from legacy tables to new tables
2. **User Migration**: Map tbl_users_register → new_users with Clerk IDs
3. **Content Migration**: 
   - Categories → Subjects/Lessons
   - Exercises → new_exercises with proper type mapping
   - Videos → new_videos
4. **Progress Migration**: Map practice history to new progress system
5. **Cleanup**: After successful migration, legacy tables can be dropped

## Important Notes

- All legacy tables use utf8_unicode_ci charset
- New tables use utf8mb4 for better Unicode support
- Foreign key constraints are maintained where applicable
- Legacy table structure is preserved exactly as in PRD
- Some legacy tables have typos (e.g., 'categorories', 'destrict') - kept as-is for compatibility