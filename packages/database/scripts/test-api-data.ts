import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApiData() {
  console.log('🧪 Testing API-ready data...\n');

  // Test subject data with lessons
  console.log('📚 Subjects with lesson counts:');
  const subjects = await prisma.subject.findMany({
    include: {
      lessons: {
        select: { id: true, grade: true },
      },
      exercises: {
        select: { id: true, type: true },
      },
      videos: {
        select: { id: true, title: true },
      },
    },
  });

  subjects.forEach(subject => {
    const lessonsByGrade = subject.lessons.reduce((acc, lesson) => {
      acc[lesson.grade] = (acc[lesson.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`   ${subject.name} (${subject.code}):`);
    console.log(`     Lessons: ${subject.lessons.length} total`);
    Object.entries(lessonsByGrade).forEach(([grade, count]) => {
      console.log(`       ${grade}: ${count}`);
    });
    console.log(`     Exercises: ${subject.exercises.length}`);
    console.log(`     Videos: ${subject.videos.length}`);
  });

  // Test user authentication data
  console.log('\n👤 User authentication test:');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      preferredLanguage: true,
      studentProfile: {
        select: {
          grade: true,
          points: true,
          level: true,
          streak: true,
        },
      },
      teacherProfile: {
        select: {
          school: true,
          subjects: true,
          verified: true,
        },
      },
    },
  });

  users.forEach(user => {
    console.log(`   ${user.firstName} ${user.lastName} (${user.role}):`);
    console.log(`     Email: ${user.email}`);
    console.log(`     Clerk ID: ${user.clerkId}`);
    console.log(`     Language: ${user.preferredLanguage}`);
    if (user.studentProfile) {
      console.log(`     Student: ${user.studentProfile.grade}, ${user.studentProfile.points} points, Level ${user.studentProfile.level}`);
    }
    if (user.teacherProfile) {
      console.log(`     Teacher: ${user.teacherProfile.school}, Subjects: ${JSON.stringify(user.teacherProfile.subjects)}`);
    }
  });

  // Test dashboard data
  console.log('\n📊 Dashboard data for Grade 5 student:');
  const student = await prisma.user.findFirst({
    where: { 
      role: 'STUDENT',
      studentProfile: { grade: 'Grade 5' }
    },
    include: {
      studentProfile: true,
      progress: {
        include: {
          lesson: {
            include: {
              subject: { select: { name: true, code: true } }
            }
          }
        }
      },
      videoProgress: {
        include: {
          video: { select: { title: true, duration: true } }
        }
      },
      notifications: {
        where: { read: false },
        select: { id: true, type: true, title: true, createdAt: true }
      }
    }
  });

  if (student) {
    console.log(`   Student: ${student.firstName} ${student.lastName}`);
    console.log(`   Grade: ${student.studentProfile?.grade}`);
    console.log(`   Points: ${student.studentProfile?.points}`);
    console.log(`   Level: ${student.studentProfile?.level}`);
    console.log(`   Streak: ${student.studentProfile?.streak} days`);
    console.log(`   Lessons in progress: ${student.progress.length}`);
    student.progress.forEach(progress => {
      console.log(`     - ${progress.lesson.subject.name}: ${progress.score}% ${progress.completed ? '✅' : '⏳'}`);
    });
    console.log(`   Video progress: ${student.videoProgress.length}`);
    console.log(`   Unread notifications: ${student.notifications.length}`);
  }

  // Test forum data
  console.log('\n💬 Forum data:');
  const forumPosts = await prisma.forumPost.findMany({
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
      answers: {
        include: {
          author: { select: { firstName: true, lastName: true, role: true } }
        }
      }
    }
  });

  forumPosts.forEach(post => {
    console.log(`   "${post.title}" by ${post.author.firstName} ${post.author.lastName} (${post.author.role})`);
    console.log(`     Subject: ${post.subject}, Views: ${post.views}, Upvotes: ${post.upvotes}`);
    console.log(`     Answers: ${post.answers.length}`);
    post.answers.forEach(answer => {
      console.log(`       - ${answer.author.firstName} ${answer.author.lastName} (${answer.author.role}) ${answer.accepted ? '✅' : ''}`);
    });
  });

  // Test assessment data
  console.log('\n📝 Assessment data:');
  const assessments = await prisma.assessment.findMany({
    include: {
      subject: { select: { name: true } },
      questions: { select: { id: true, points: true } },
      attempts: {
        include: {
          user: { select: { firstName: true, lastName: true } }
        }
      }
    }
  });

  assessments.forEach(assessment => {
    console.log(`   "${assessment.title}" (${assessment.type})`);
    console.log(`     Subject: ${assessment.subject?.name || 'General'}`);
    console.log(`     Grade: ${assessment.grade}`);
    console.log(`     Duration: ${assessment.duration} minutes`);
    console.log(`     Questions: ${assessment.questions.length}`);
    console.log(`     Total attempts: ${assessment.attempts.length}`);
    assessment.attempts.forEach(attempt => {
      console.log(`       - ${attempt.user.firstName} ${attempt.user.lastName}: ${attempt.score || 'In progress'}`);
    });
  });

  console.log('\n✅ API data test complete!');
}

testApiData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());