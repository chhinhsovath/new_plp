import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createNewTables() {
  try {
    console.log("Creating new tables alongside existing MySQL database...");

    // Create new tables with SQL
    const createTableQueries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS new_users (
        id VARCHAR(191) NOT NULL,
        clerkId VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        firstName VARCHAR(191) NOT NULL,
        lastName VARCHAR(191) NOT NULL,
        role ENUM('STUDENT', 'PARENT', 'TEACHER', 'ADMIN') NOT NULL,
        preferredLanguage ENUM('KM', 'EN') NOT NULL DEFAULT 'KM',
        parentId VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (clerkId),
        UNIQUE KEY (email),
        INDEX (email),
        INDEX (clerkId)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Student profiles
      `CREATE TABLE IF NOT EXISTS new_student_profiles (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        grade VARCHAR(191) NOT NULL,
        school VARCHAR(191),
        points INT NOT NULL DEFAULT 0,
        level INT NOT NULL DEFAULT 1,
        streak INT NOT NULL DEFAULT 0,
        lastActive DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY (userId),
        INDEX (userId),
        CONSTRAINT fk_student_user FOREIGN KEY (userId) REFERENCES new_users(id) ON DELETE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Teacher profiles
      `CREATE TABLE IF NOT EXISTS new_teacher_profiles (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        school VARCHAR(191) NOT NULL,
        subjects JSON NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT false,
        PRIMARY KEY (id),
        UNIQUE KEY (userId),
        INDEX (userId),
        CONSTRAINT fk_teacher_user FOREIGN KEY (userId) REFERENCES new_users(id) ON DELETE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Subjects
      `CREATE TABLE IF NOT EXISTS new_subjects (
        id VARCHAR(191) NOT NULL,
        code VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        nameKh VARCHAR(191) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(191),
        \`order\` INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        PRIMARY KEY (id),
        UNIQUE KEY (code)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Lessons
      `CREATE TABLE IF NOT EXISTS new_lessons (
        id VARCHAR(191) NOT NULL,
        subjectId VARCHAR(191) NOT NULL,
        title VARCHAR(191) NOT NULL,
        titleKh VARCHAR(191) NOT NULL,
        description TEXT NOT NULL,
        grade VARCHAR(191) NOT NULL,
        \`order\` INT NOT NULL DEFAULT 0,
        duration INT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        PRIMARY KEY (id),
        INDEX (subjectId, grade),
        CONSTRAINT fk_lesson_subject FOREIGN KEY (subjectId) REFERENCES new_subjects(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Exercises
      `CREATE TABLE IF NOT EXISTS new_exercises (
        id VARCHAR(191) NOT NULL,
        subjectId VARCHAR(191) NOT NULL,
        lessonId VARCHAR(191),
        type ENUM('MULTIPLE_CHOICE', 'FILL_IN_GAPS', 'DRAG_DROP', 'MATCHING', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER', 'LISTENING', 'SPEAKING', 'DRAWING', 'SORTING', 'SEQUENCING', 'LABELING', 'DICTATION', 'FIND_WORD', 'FIND_LETTER', 'CHOOSE_WORD', 'INPUT', 'SELECT_SENTENCE', 'WRITE_ANSWER') NOT NULL,
        title VARCHAR(191) NOT NULL,
        titleKh VARCHAR(191) NOT NULL,
        instructions TEXT NOT NULL,
        content JSON NOT NULL,
        solution JSON NOT NULL,
        difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'EASY',
        grade VARCHAR(191) NOT NULL,
        points INT NOT NULL DEFAULT 10,
        \`order\` INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        PRIMARY KEY (id),
        INDEX (subjectId, type, grade),
        INDEX (lessonId),
        CONSTRAINT fk_exercise_subject FOREIGN KEY (subjectId) REFERENCES new_subjects(id),
        CONSTRAINT fk_exercise_lesson FOREIGN KEY (lessonId) REFERENCES new_lessons(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Exercise attempts
      `CREATE TABLE IF NOT EXISTS new_exercise_attempts (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        exerciseId VARCHAR(191) NOT NULL,
        answer JSON NOT NULL,
        isCorrect BOOLEAN NOT NULL,
        score INT NOT NULL,
        timeSpent INT NOT NULL,
        attempts INT NOT NULL DEFAULT 1,
        completedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX (userId, exerciseId),
        INDEX (completedAt),
        CONSTRAINT fk_attempt_exercise FOREIGN KEY (exerciseId) REFERENCES new_exercises(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Progress
      `CREATE TABLE IF NOT EXISTS new_progress (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        lessonId VARCHAR(191) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        score DOUBLE NOT NULL DEFAULT 0,
        startedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY unique_progress (userId, lessonId),
        INDEX (userId),
        CONSTRAINT fk_progress_user FOREIGN KEY (userId) REFERENCES new_users(id),
        CONSTRAINT fk_progress_lesson FOREIGN KEY (lessonId) REFERENCES new_lessons(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Forum posts
      `CREATE TABLE IF NOT EXISTS new_forum_posts (
        id VARCHAR(191) NOT NULL,
        authorId VARCHAR(191) NOT NULL,
        subject VARCHAR(191) NOT NULL,
        title VARCHAR(191) NOT NULL,
        content TEXT NOT NULL,
        tags JSON NOT NULL,
        views INT NOT NULL DEFAULT 0,
        upvotes INT NOT NULL DEFAULT 0,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        INDEX (subject),
        INDEX (createdAt),
        CONSTRAINT fk_post_author FOREIGN KEY (authorId) REFERENCES new_users(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Forum answers
      `CREATE TABLE IF NOT EXISTS new_forum_answers (
        id VARCHAR(191) NOT NULL,
        postId VARCHAR(191) NOT NULL,
        authorId VARCHAR(191) NOT NULL,
        content TEXT NOT NULL,
        upvotes INT NOT NULL DEFAULT 0,
        accepted BOOLEAN NOT NULL DEFAULT false,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        INDEX (postId),
        CONSTRAINT fk_answer_post FOREIGN KEY (postId) REFERENCES new_forum_posts(id) ON DELETE CASCADE,
        CONSTRAINT fk_answer_author FOREIGN KEY (authorId) REFERENCES new_users(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Saved posts
      `CREATE TABLE IF NOT EXISTS new_saved_posts (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        postId VARCHAR(191) NOT NULL,
        savedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY unique_saved (userId, postId),
        CONSTRAINT fk_saved_post FOREIGN KEY (postId) REFERENCES new_forum_posts(id) ON DELETE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Payments
      `CREATE TABLE IF NOT EXISTS new_payments (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        amount DOUBLE NOT NULL,
        currency ENUM('USD', 'KHR') NOT NULL,
        status ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL,
        paymentMethod VARCHAR(191) NOT NULL,
        paymentIntentId VARCHAR(191),
        description VARCHAR(191) NOT NULL,
        metadata JSON,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (paymentIntentId),
        INDEX (userId),
        INDEX (status),
        CONSTRAINT fk_payment_user FOREIGN KEY (userId) REFERENCES new_users(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Notifications
      `CREATE TABLE IF NOT EXISTS new_notifications (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        type ENUM('ASSIGNMENT_CREATED', 'ASSIGNMENT_DUE_SOON', 'ASSIGNMENT_GRADED', 'CLASS_ANNOUNCEMENT', 'LIVE_CLASS_STARTING', 'NEW_MESSAGE', 'ACHIEVEMENT_EARNED', 'SUBSCRIPTION_EXPIRING', 'SYSTEM_ALERT') NOT NULL,
        title VARCHAR(191) NOT NULL,
        message TEXT NOT NULL,
        data JSON,
        \`read\` BOOLEAN NOT NULL DEFAULT false,
        readAt DATETIME(3),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX (userId, \`read\`),
        INDEX (createdAt),
        CONSTRAINT fk_notification_user FOREIGN KEY (userId) REFERENCES new_users(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Notification preferences
      `CREATE TABLE IF NOT EXISTS new_notification_preferences (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        emailAssignments BOOLEAN NOT NULL DEFAULT true,
        emailGrades BOOLEAN NOT NULL DEFAULT true,
        emailAnnouncements BOOLEAN NOT NULL DEFAULT true,
        emailMessages BOOLEAN NOT NULL DEFAULT true,
        pushAssignments BOOLEAN NOT NULL DEFAULT true,
        pushGrades BOOLEAN NOT NULL DEFAULT true,
        pushAnnouncements BOOLEAN NOT NULL DEFAULT true,
        pushMessages BOOLEAN NOT NULL DEFAULT true,
        pushLiveClasses BOOLEAN NOT NULL DEFAULT true,
        inAppAll BOOLEAN NOT NULL DEFAULT true,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY (userId),
        CONSTRAINT fk_notif_pref_user FOREIGN KEY (userId) REFERENCES new_users(id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

      // Add parent-child self-referencing foreign key
      `ALTER TABLE new_users ADD CONSTRAINT fk_user_parent FOREIGN KEY (parentId) REFERENCES new_users(id);`,
    ];

    // Execute each query
    for (const query of createTableQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log("✓ Executed:", query.substring(0, 50) + "...");
      } catch (error: any) {
        if (error.code === 'P2010' && error.message.includes('already exists')) {
          console.log("✓ Table already exists:", query.substring(0, 50) + "...");
        } else {
          console.error("✗ Failed:", query.substring(0, 50) + "...");
          console.error(error.message);
        }
      }
    }

    console.log("\n✅ New tables created successfully!");
    console.log("\nNext steps:");
    console.log("1. Update your application code to use the new table names");
    console.log("2. Create a data migration script to copy data from old tables to new ones");
    console.log("3. After testing, you can drop the old tables");

  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createNewTables().catch(console.error);