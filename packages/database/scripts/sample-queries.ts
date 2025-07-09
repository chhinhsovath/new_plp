import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sampleQueries() {
  console.log('📝 Sample API Queries\n');

  // 1. Get all subjects with lesson counts
  console.log('1. 📚 GET /api/subjects - Get all subjects with lesson counts:');
  const subjects = await prisma.subject.findMany({
    where: { active: true },
    include: {
      _count: {
        select: {
          lessons: true,
          exercises: true,
          videos: true,
        },
      },
    },
    orderBy: { order: 'asc' },
  });
  
  subjects.forEach(subject => {
    console.log(`   ${subject.name} (${subject.code}): ${subject._count.lessons} lessons, ${subject._count.exercises} exercises, ${subject._count.videos} videos`);
  });

  // 2. Get lessons for a specific subject and grade
  console.log('\n2. 📖 GET /api/subjects/math/lessons?grade=Grade%205 - Get Math lessons for Grade 5:');
  const mathLessons = await prisma.lesson.findMany({
    where: {
      subject: { code: 'math' },
      grade: 'Grade 5',
      active: true,
    },
    include: {
      _count: {
        select: { exercises: true },
      },
    },
    orderBy: { order: 'asc' },
  });
  
  mathLessons.forEach(lesson => {
    console.log(`   ${lesson.title} (${lesson.exercises} exercises)`);
  });

  // 3. Get user with profile
  console.log('\n3. 👤 GET /api/users/me - Get current user profile:');
  const studentUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: {
      studentProfile: true,
      parent: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
  
  if (studentUser) {
    console.log(`   User: ${studentUser.firstName} ${studentUser.lastName} (${studentUser.role})`);
    console.log(`   Email: ${studentUser.email}`);
    console.log(`   Language: ${studentUser.preferredLanguage}`);
    if (studentUser.studentProfile) {
      console.log(`   Grade: ${studentUser.studentProfile.grade}`);
      console.log(`   Points: ${studentUser.studentProfile.points}`);
      console.log(`   Level: ${studentUser.studentProfile.level}`);
      console.log(`   Streak: ${studentUser.studentProfile.streak} days`);
    }
    if (studentUser.parent) {
      console.log(`   Parent: ${studentUser.parent.firstName} ${studentUser.parent.lastName}`);
    }
  }

  // 4. Get student progress
  console.log('\n4. 📊 GET /api/progress - Get student progress:');
  const progress = await prisma.progress.findMany({
    where: { userId: studentUser?.id },
    include: {
      lesson: {
        include: {
          subject: {
            select: { name: true, code: true, icon: true },
          },
        },
      },
    },
  });
  
  progress.forEach(p => {
    console.log(`   ${p.lesson.subject.name} - ${p.lesson.title}: ${p.score}% ${p.completed ? '✅' : '⏳'}`);
  });

  // 5. Get exercises for a lesson
  console.log('\n5. 🎯 GET /api/lessons/:id/exercises - Get exercises for a lesson:');
  const lessonExercises = await prisma.exercise.findMany({
    where: {
      lessonId: mathLessons[0]?.id,
      active: true,
    },
    select: {
      id: true,
      title: true,
      type: true,
      difficulty: true,
      points: true,
      instructions: true,
    },
    orderBy: { order: 'asc' },
  });
  
  lessonExercises.forEach(exercise => {
    console.log(`   ${exercise.title} (${exercise.type}) - ${exercise.difficulty} - ${exercise.points} points`);
  });

  // 6. Get forum posts
  console.log('\n6. 💬 GET /api/forum/posts - Get forum posts:');
  const forumPosts = await prisma.forumPost.findMany({
    include: {
      author: {
        select: { firstName: true, lastName: true, role: true },
      },
      _count: {
        select: { answers: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  forumPosts.forEach(post => {
    console.log(`   "${post.title}" by ${post.author.firstName} ${post.author.lastName} (${post.author.role})`);
    console.log(`     Subject: ${post.subject}, Views: ${post.views}, Answers: ${post._count.answers}`);
  });

  // 7. Get videos for a subject
  console.log('\n7. 🎥 GET /api/videos?subject=math - Get videos for Math subject:');
  const videos = await prisma.video.findMany({
    where: {
      subject: { code: 'math' },
    },
    include: {
      subject: {
        select: { name: true, code: true },
      },
    },
  });
  
  videos.forEach(video => {
    console.log(`   "${video.title}" (${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')})`);
    console.log(`     Subject: ${video.subject.name}, Grade: ${video.grade}, Views: ${video.views}`);
  });

  // 8. Get library resources
  console.log('\n8. 📚 GET /api/library/resources - Get library resources:');
  const resources = await prisma.libraryResource.findMany({
    include: {
      subject: {
        select: { name: true, code: true },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  });
  
  resources.forEach(resource => {
    console.log(`   "${resource.title}" (${resource.type})`);
    console.log(`     Subject: ${resource.subject?.name || 'General'}, Grade: ${resource.grade || 'All'}`);
    console.log(`     Size: ${Math.round(resource.fileSize / 1024 / 1024 * 100) / 100} MB, Downloads: ${resource.downloads}`);
  });

  // 9. Get assessments
  console.log('\n9. 📝 GET /api/assessments - Get available assessments:');
  const assessments = await prisma.assessment.findMany({
    include: {
      subject: {
        select: { name: true, code: true },
      },
      _count: {
        select: { questions: true, attempts: true },
      },
    },
  });
  
  assessments.forEach(assessment => {
    console.log(`   "${assessment.title}" (${assessment.type})`);
    console.log(`     Subject: ${assessment.subject?.name || 'General'}, Grade: ${assessment.grade}`);
    console.log(`     Duration: ${assessment.duration} min, Questions: ${assessment._count.questions}, Attempts: ${assessment._count.attempts}`);
  });

  // 10. Get notifications
  console.log('\n10. 🔔 GET /api/notifications - Get user notifications:');
  const notifications = await prisma.notification.findMany({
    where: { userId: studentUser?.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  notifications.forEach(notification => {
    console.log(`   ${notification.title} (${notification.type}) ${notification.read ? '✅' : '🔔'}`);
    console.log(`     ${notification.message}`);
  });

  // 11. Get professional development courses (for teachers)
  console.log('\n11. 🎓 GET /api/professional-development/courses - Get PD courses:');
  const pdCourses = await prisma.professionalDevelopmentCourse.findMany({
    include: {
      _count: {
        select: { modules: true, enrollments: true },
      },
    },
  });
  
  pdCourses.forEach(course => {
    console.log(`   "${course.title}" (${course.level})`);
    console.log(`     Duration: ${course.duration} hours, Modules: ${course._count.modules}, Enrollments: ${course._count.enrollments}`);
  });

  // 12. Get payment history
  console.log('\n12. 💳 GET /api/payments - Get payment history:');
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  payments.forEach(payment => {
    console.log(`   $${payment.amount} ${payment.currency} - ${payment.status}`);
    console.log(`     User: ${payment.user.firstName} ${payment.user.lastName}`);
    console.log(`     Method: ${payment.paymentMethod}, Description: ${payment.description}`);
  });

  console.log('\n✅ Sample queries complete!');
}

sampleQueries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());