import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying seeded data...\n');

  // Count records in each table
  const counts = {
    users: await prisma.user.count(),
    subjects: await prisma.subject.count(),
    lessons: await prisma.lesson.count(),
    exercises: await prisma.exercise.count(),
    videos: await prisma.video.count(),
    libraryResources: await prisma.libraryResource.count(),
    pdCourses: await prisma.professionalDevelopmentCourse.count(),
    assessments: await prisma.assessment.count(),
    forumPosts: await prisma.forumPost.count(),
    notifications: await prisma.notification.count(),
  };

  console.log('📊 Record Counts:');
  Object.entries(counts).forEach(([table, count]) => {
    console.log(`   ${table}: ${count}`);
  });

  // Show subjects
  console.log('\n📚 Subjects:');
  const subjects = await prisma.subject.findMany({ orderBy: { order: 'asc' } });
  subjects.forEach(subject => {
    console.log(`   - ${subject.name} (${subject.code}) ${subject.icon}`);
  });

  // Show users by role
  console.log('\n👥 Users by Role:');
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { role: true },
  });
  usersByRole.forEach(group => {
    console.log(`   ${group.role}: ${group._count.role}`);
  });

  // Show sample exercises
  console.log('\n🎯 Sample Exercises:');
  const exercises = await prisma.exercise.findMany({
    take: 5,
    include: { subject: true, lesson: true },
  });
  exercises.forEach(exercise => {
    console.log(`   - ${exercise.title} (${exercise.type}) - ${exercise.subject.name} ${exercise.lesson?.grade || ''}`);
  });

  // Show student progress
  console.log('\n📈 Student Progress:');
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      studentProfile: true,
      progress: true,
    },
  });
  students.forEach(student => {
    console.log(`   - ${student.firstName} ${student.lastName}:`);
    console.log(`     Grade: ${student.studentProfile?.grade}`);
    console.log(`     Points: ${student.studentProfile?.points}`);
    console.log(`     Lessons in progress: ${student.progress.length}`);
  });

  // Show PD enrollments
  console.log('\n🎓 Professional Development:');
  const enrollments = await prisma.pDEnrollment.findMany({
    include: {
      teacher: true,
      course: true,
    },
  });
  enrollments.forEach(enrollment => {
    console.log(`   - ${enrollment.teacher.firstName} ${enrollment.teacher.lastName} enrolled in "${enrollment.course.title}" (${enrollment.progress}% complete)`);
  });

  console.log('\n✅ Verification complete!');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());