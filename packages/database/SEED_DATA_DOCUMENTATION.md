# Database Seed Data Documentation

## Overview
The database has been successfully seeded with comprehensive test data for the Primary Learning Platform (PLP). This data covers all major features and provides a realistic testing environment.

## Seed Data Summary

### 📊 Records Created
- **Users**: 7 total (1 Admin, 2 Teachers, 1 Parent, 3 Students)
- **Subjects**: 6 subjects (Math, Khmer, English, Science, Social Studies, CALM)
- **Lessons**: 108 lessons (18 lessons per subject, 3 per grade)
- **Exercises**: 9 exercises (Math and Khmer examples)
- **Videos**: 3 videos (Math, Khmer, Science)
- **Library Resources**: 3 resources (PDF, EBOOK, GUIDE)
- **PD Courses**: 1 course with 2 modules
- **Assessments**: 2 assessments (Math test + EGRA)
- **Forum Posts**: 2 posts with 1 answer
- **Notifications**: 2 notifications
- **Progress Records**: Student progress tracking
- **Payment Records**: 1 successful payment

## Test User Accounts

### 🔐 Authentication Test Users
All users have Clerk IDs for authentication testing:

1. **Admin User**
   - Email: `admin@plp.edu.kh`
   - Clerk ID: `clerk_admin_123`
   - Role: ADMIN
   - Language: English

2. **Teacher 1 - Sokha Kim**
   - Email: `sokha.teacher@plp.edu.kh`
   - Clerk ID: `clerk_teacher_1`
   - Role: TEACHER
   - Language: Khmer
   - School: Phnom Penh Primary School
   - Subjects: Math, Science
   - Status: Verified

3. **Teacher 2 - Dara Sok**
   - Email: `dara.teacher@plp.edu.kh`
   - Clerk ID: `clerk_teacher_2`
   - Role: TEACHER
   - Language: Khmer
   - School: Siem Reap Primary School
   - Subjects: Khmer, Social Studies
   - Status: Verified

4. **Parent - Sophea Chan**
   - Email: `parent1@example.com`
   - Clerk ID: `clerk_parent_1`
   - Role: PARENT
   - Language: Khmer
   - Children: 2 (Virak and Sreymom)

5. **Student 1 - Virak Chan** (Child of Sophea)
   - Email: `virak.student@plp.edu.kh`
   - Clerk ID: `clerk_student_1`
   - Role: STUDENT
   - Language: Khmer
   - Grade: Grade 5
   - Points: 250, Level: 3, Streak: 7 days
   - Has progress in Math lessons
   - Has forum posts and notifications

6. **Student 2 - Sreymom Chan** (Child of Sophea)
   - Email: `sreymom.student@plp.edu.kh`
   - Clerk ID: `clerk_student_2`
   - Role: STUDENT
   - Language: Khmer
   - Grade: Grade 3
   - Points: 180, Level: 2, Streak: 3 days

7. **Student 3 - Kosal Pich** (Independent)
   - Email: `kosal.student@plp.edu.kh`
   - Clerk ID: `clerk_student_3`
   - Role: STUDENT
   - Language: English
   - Grade: Grade 6
   - Points: 450, Level: 5, Streak: 15 days

## 📚 Educational Content

### Subjects
All 6 subjects are fully implemented:
1. **Mathematics** (math) 🔢 - 18 lessons, 6 exercises, 1 video
2. **Khmer Language** (khmer) 🇰🇭 - 18 lessons, 3 exercises, 1 video  
3. **English Language** (english) 🔤 - 18 lessons
4. **Science** (science) 🔬 - 18 lessons, 1 video
5. **Social Studies** (social_studies) 🌍 - 18 lessons
6. **CALM** (calm) 🎨 - 18 lessons

### Lessons Structure
- **3 lessons per grade** (Grades 1-6)
- **18 lessons per subject** (total 108 lessons)
- Each lesson has bilingual titles (English + Khmer)
- 45-minute duration per lesson
- Proper ordering and grade assignment

### Sample Exercises
- **Math**: Addition (Multiple Choice), Multiplication (Fill-in-blanks)
- **Khmer**: Word Matching exercise
- Various difficulty levels (Easy, Medium, Hard)
- Point-based scoring system
- Bilingual instructions

### Videos
- **Math**: Introduction to Fractions (10 minutes)
- **Khmer**: Alphabet Song (3 minutes)
- **Science**: Water Cycle Experiment (12 minutes)
- All videos have thumbnails and proper metadata

### Library Resources
- **PDF**: Grade 5 Mathematics Workbook (5MB)
- **EBOOK**: Khmer Reading Practice (2MB)
- **GUIDE**: Science Experiment Guide (3MB)
- Download tracking implemented

## 🎓 Professional Development

### Course: "Modern Teaching Methods"
- **Level**: Intermediate
- **Duration**: 20 hours
- **Modules**: 2 modules
  1. Introduction to Active Learning (90 minutes)
  2. Technology in the Classroom (120 minutes)
- **Enrollment**: Teacher Sokha Kim (50% complete)
- **Certificate**: Template ready for issuance

## 📝 Assessment System

### Assessment 1: Grade 5 Mathematics Mid-term
- **Type**: Proficiency Test
- **Duration**: 60 minutes
- **Questions**: 2 questions
- **Attempts**: 1 (by Virak Chan, score: 8/10)

### Assessment 2: EGRA - Khmer Reading Assessment
- **Type**: EGRA (Early Grade Reading Assessment)
- **Duration**: 30 minutes
- **Questions**: 2 questions (letter identification, word reading)
- **Grade**: Grade 2 level
- **Attempts**: 0 (available for testing)

## 💬 Forum System

### Forum Posts
1. **"Need help with fractions"** by Virak Chan (Student)
   - Subject: Math
   - Views: 25
   - Answers: 1 (by Teacher Sokha Kim - accepted answer)

2. **"Fun Science Experiment Ideas"** by Sokha Kim (Teacher)
   - Subject: Science
   - Views: 45, Upvotes: 12
   - Answers: 0

### Features Demonstrated
- Student-teacher interaction
- Answer acceptance system
- View counting and upvoting
- Subject-based categorization

## 📊 Progress Tracking

### Student Progress (Virak Chan)
- **Math Unit 1**: 85% completed ✅
- **Math Unit 2**: 60% in progress ⏳
- **Video Progress**: Watched 5 minutes of Fractions video
- **Exercise Attempts**: 2 successful attempts
- **Notifications**: 1 unread achievement notification

## 🔔 Notifications

### Sample Notifications
1. **Achievement Earned**: "Week Warrior" badge for 7-day streak
2. **Assignment Graded**: Math assignment graded for Virak

### Notification Preferences
- Email: Assignments, Grades, Announcements enabled
- Push: All notifications enabled
- In-app: All notifications enabled

## 💳 Payment System

### Sample Payment
- **Amount**: $5.00 USD
- **Status**: Succeeded
- **Method**: Card
- **Description**: Monthly subscription
- **User**: Sophea Chan (Parent)
- **Metadata**: Premium plan for 2 children

## 🚀 Testing the Data

### Available Scripts
```bash
# Run the seed (populate database)
pnpm db:seed

# Verify the seeded data
npx tsx scripts/verify-seed.ts

# Test API-ready data queries
npx tsx scripts/test-api-data.ts

# Run sample API queries
npx tsx scripts/sample-queries.ts
```

### Key Test Scenarios

1. **Authentication Flow**
   - All users have Clerk IDs for testing auth
   - Role-based access control data ready
   - Parent-child relationships established

2. **Student Dashboard**
   - Progress tracking across subjects
   - Points, levels, streaks implemented
   - Achievement system ready

3. **Teacher Dashboard**
   - Student progress monitoring
   - Professional development enrollment
   - Class management data

4. **Parent Dashboard**
   - Multi-child monitoring (Virak + Sreymom)
   - Payment history
   - Notification preferences

5. **Learning Flow**
   - Subject → Lesson → Exercise progression
   - Video content with progress tracking
   - Assessment taking with scoring

6. **Community Features**
   - Forum posts and answers
   - Teacher-student interactions
   - Content sharing and discussions

## 🔧 Database Health

### Relationships Verified
- ✅ User → Profile relationships (Student/Teacher)
- ✅ Parent → Children relationships
- ✅ Subject → Lesson → Exercise hierarchy
- ✅ User → Progress → Exercise attempts
- ✅ Forum → Posts → Answers
- ✅ Assessment → Questions → Attempts
- ✅ PD Course → Modules → Enrollments

### Data Integrity
- All required fields populated
- Proper foreign key relationships
- Realistic data values
- Bilingual content where applicable
- Time-based data (created dates, progress tracking)

## 🎯 Ready for Testing

The database is now fully populated with realistic test data that covers:
- All user roles and authentication scenarios
- Complete educational content hierarchy
- Interactive learning features
- Community and collaboration tools
- Progress tracking and analytics
- Payment and subscription management
- Notification system
- Professional development platform
- Assessment and testing capabilities

This comprehensive seed data provides a solid foundation for testing all aspects of the Primary Learning Platform.