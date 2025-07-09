import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.savedPost.deleteMany();
  await prisma.forumAnswer.deleteMany();
  await prisma.forumPost.deleteMany();
  await prisma.exerciseAttempt.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.assessmentResponse.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.pDIssuedCertificate.deleteMany();
  await prisma.pDModuleCompletion.deleteMany();
  await prisma.pDEnrollment.deleteMany();
  await prisma.pDCertificate.deleteMany();
  await prisma.pDModule.deleteMany();
  await prisma.professionalDevelopmentCourse.deleteMany();
  await prisma.resourceDownload.deleteMany();
  await prisma.libraryResource.deleteMany();
  await prisma.videoProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create Subjects (all 6 subjects)
  console.log('📚 Creating subjects...');
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        code: 'math',
        name: 'Mathematics',
        nameKh: 'គណិតវិទ្យា',
        description: 'Learn mathematics from basic arithmetic to advanced concepts',
        icon: '🔢',
        order: 1,
        active: true,
      },
    }),
    prisma.subject.create({
      data: {
        code: 'khmer',
        name: 'Khmer Language',
        nameKh: 'ភាសាខ្មែរ',
        description: 'Master reading, writing, and speaking in Khmer',
        icon: '🇰🇭',
        order: 2,
        active: true,
      },
    }),
    prisma.subject.create({
      data: {
        code: 'english',
        name: 'English Language',
        nameKh: 'ភាសាអង់គ្លេស',
        description: 'Learn English communication skills',
        icon: '🔤',
        order: 3,
        active: true,
      },
    }),
    prisma.subject.create({
      data: {
        code: 'science',
        name: 'Science',
        nameKh: 'វិទ្យាសាស្ត្រ',
        description: 'Explore the natural world through science',
        icon: '🔬',
        order: 4,
        active: true,
      },
    }),
    prisma.subject.create({
      data: {
        code: 'social_studies',
        name: 'Social Studies',
        nameKh: 'សិក្សាសង្គម',
        description: 'Learn about society, history, and geography',
        icon: '🌍',
        order: 5,
        active: true,
      },
    }),
    prisma.subject.create({
      data: {
        code: 'calm',
        name: 'CALM',
        nameKh: 'ចរិយា សិល្បៈ ជីវិត និងតន្ត្រី',
        description: 'Character, Arts, Life Skills, and Music',
        icon: '🎨',
        order: 6,
        active: true,
      },
    }),
  ]);

  // Create Users
  console.log('👥 Creating users...');
  
  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_123',
      email: 'admin@plp.edu.kh',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      preferredLanguage: 'EN',
    },
  });

  // Teacher users
  const teacher1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_teacher_1',
      email: 'sokha.teacher@plp.edu.kh',
      firstName: 'Sokha',
      lastName: 'Kim',
      role: 'TEACHER',
      preferredLanguage: 'KM',
      teacherProfile: {
        create: {
          school: 'Phnom Penh Primary School',
          subjects: ['math', 'science'],
          verified: true,
        },
      },
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_teacher_2',
      email: 'dara.teacher@plp.edu.kh',
      firstName: 'Dara',
      lastName: 'Sok',
      role: 'TEACHER',
      preferredLanguage: 'KM',
      teacherProfile: {
        create: {
          school: 'Siem Reap Primary School',
          subjects: ['khmer', 'social_studies'],
          verified: true,
        },
      },
    },
  });

  // Parent user
  const parent1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_parent_1',
      email: 'parent1@example.com',
      firstName: 'Sophea',
      lastName: 'Chan',
      role: 'PARENT',
      preferredLanguage: 'KM',
    },
  });

  // Student users (children of parent1)
  const student1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_student_1',
      email: 'virak.student@plp.edu.kh',
      firstName: 'Virak',
      lastName: 'Chan',
      role: 'STUDENT',
      preferredLanguage: 'KM',
      parentId: parent1.id,
      studentProfile: {
        create: {
          grade: 'Grade 5',
          school: 'Phnom Penh Primary School',
          points: 250,
          level: 3,
          streak: 7,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_student_2',
      email: 'sreymom.student@plp.edu.kh',
      firstName: 'Sreymom',
      lastName: 'Chan',
      role: 'STUDENT',
      preferredLanguage: 'KM',
      parentId: parent1.id,
      studentProfile: {
        create: {
          grade: 'Grade 3',
          school: 'Phnom Penh Primary School',
          points: 180,
          level: 2,
          streak: 3,
        },
      },
    },
  });

  // Independent student
  const student3 = await prisma.user.create({
    data: {
      clerkId: 'clerk_student_3',
      email: 'kosal.student@plp.edu.kh',
      firstName: 'Kosal',
      lastName: 'Pich',
      role: 'STUDENT',
      preferredLanguage: 'EN',
      studentProfile: {
        create: {
          grade: 'Grade 6',
          school: 'International School of Phnom Penh',
          points: 450,
          level: 5,
          streak: 15,
        },
      },
    },
  });

  // Create Lessons for each subject
  console.log('📖 Creating lessons...');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  
  for (const subject of subjects) {
    for (const grade of grades) {
      // Create 3 lessons per grade per subject
      for (let i = 1; i <= 3; i++) {
        await prisma.lesson.create({
          data: {
            subjectId: subject.id,
            title: `${subject.name} - ${grade} - Unit ${i}`,
            titleKh: `${subject.nameKh} - ថ្នាក់ទី${grade.replace('Grade ', '')} - មេរៀនទី ${i}`,
            description: `Learning objectives for ${subject.name} ${grade} Unit ${i}`,
            grade,
            order: i,
            duration: 45, // 45 minutes per lesson
            active: true,
          },
        });
      }
    }
  }

  // Get some lessons for exercises
  const mathLessons = await prisma.lesson.findMany({
    where: { subject: { code: 'math' }, grade: 'Grade 5' },
    take: 3,
  });

  const khmerLessons = await prisma.lesson.findMany({
    where: { subject: { code: 'khmer' }, grade: 'Grade 3' },
    take: 3,
  });

  // Create Exercises
  console.log('🎯 Creating exercises...');
  const exercises = [];

  // Math exercises
  for (const lesson of mathLessons) {
    exercises.push(
      await prisma.exercise.create({
        data: {
          subjectId: subjects[0].id, // Math
          lessonId: lesson.id,
          type: 'MULTIPLE_CHOICE',
          title: 'Addition Practice',
          titleKh: 'លំហាត់បូក',
          instructions: 'Choose the correct answer',
          content: {
            question: 'What is 25 + 37?',
            options: ['52', '62', '72', '82'],
            correctAnswer: 1, // index 1 = '62'
          },
          solution: {
            answer: '62',
            explanation: '25 + 37 = 62. We add the ones place: 5 + 7 = 12 (write 2, carry 1). Then add the tens place: 2 + 3 + 1 = 6.',
          },
          difficulty: 'EASY',
          grade: 'Grade 5',
          points: 10,
          active: true,
        },
      })
    );

    exercises.push(
      await prisma.exercise.create({
        data: {
          subjectId: subjects[0].id,
          lessonId: lesson.id,
          type: 'FILL_IN_GAPS',
          title: 'Multiplication Fill-in',
          titleKh: 'បំពេញចន្លោះគុណ',
          instructions: 'Fill in the missing number',
          content: {
            question: '8 × ___ = 56',
            correctAnswer: '7',
          },
          solution: {
            answer: '7',
            explanation: '8 × 7 = 56. We can find this by dividing: 56 ÷ 8 = 7',
          },
          difficulty: 'MEDIUM',
          grade: 'Grade 5',
          points: 15,
          active: true,
        },
      })
    );
  }

  // Khmer exercises
  for (const lesson of khmerLessons) {
    exercises.push(
      await prisma.exercise.create({
        data: {
          subjectId: subjects[1].id, // Khmer
          lessonId: lesson.id,
          type: 'MATCHING',
          title: 'Word Matching',
          titleKh: 'ផ្គូផ្គងពាក្យ',
          instructions: 'Match the words with their meanings',
          content: {
            leftItems: ['សាលា', 'គ្រូ', 'សិស្ស', 'សៀវភៅ'],
            rightItems: ['School', 'Teacher', 'Student', 'Book'],
            correctPairs: [[0, 0], [1, 1], [2, 2], [3, 3]],
          },
          solution: {
            explanation: 'សាលា = School, គ្រូ = Teacher, សិស្ស = Student, សៀវភៅ = Book',
          },
          difficulty: 'EASY',
          grade: 'Grade 3',
          points: 20,
          active: true,
        },
      })
    );
  }

  // Create Videos
  console.log('🎥 Creating videos...');
  const videos = await Promise.all([
    prisma.video.create({
      data: {
        title: 'Introduction to Fractions',
        titleKh: 'ការណែនាំអំពីប្រភាគ',
        description: 'Learn the basics of fractions with visual examples',
        url: 'https://example.com/videos/math-fractions.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/math-fractions.jpg',
        duration: 600, // 10 minutes
        subjectId: subjects[0].id,
        grade: 'Grade 5',
        lessonId: mathLessons[0].id,
        uploadedBy: teacher1.id,
        tags: ['fractions', 'mathematics', 'grade5'],
      },
    }),
    prisma.video.create({
      data: {
        title: 'Khmer Alphabet Song',
        titleKh: 'ចម្រៀងអក្សរខ្មែរ',
        description: 'Fun song to learn Khmer alphabet',
        url: 'https://example.com/videos/khmer-alphabet.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/khmer-alphabet.jpg',
        duration: 180, // 3 minutes
        subjectId: subjects[1].id,
        grade: 'Grade 1',
        uploadedBy: teacher2.id,
        tags: ['alphabet', 'khmer', 'song', 'grade1'],
      },
    }),
    prisma.video.create({
      data: {
        title: 'Science Experiment: Water Cycle',
        titleKh: 'ពិសោធន៍វិទ្យាសាស្ត្រ៖ វដ្តទឹក',
        description: 'Understand the water cycle through simple experiments',
        url: 'https://example.com/videos/water-cycle.mp4',
        thumbnailUrl: 'https://example.com/thumbnails/water-cycle.jpg',
        duration: 720, // 12 minutes
        subjectId: subjects[3].id,
        grade: 'Grade 4',
        uploadedBy: teacher1.id,
        tags: ['science', 'water-cycle', 'experiment', 'grade4'],
      },
    }),
  ]);

  // Create Library Resources
  console.log('📚 Creating library resources...');
  const resources = await Promise.all([
    prisma.libraryResource.create({
      data: {
        title: 'Grade 5 Mathematics Workbook',
        titleKh: 'សៀវភៅលំហាត់គណិតវិទ្យាថ្នាក់ទី៥',
        description: 'Complete workbook with exercises and solutions',
        type: 'PDF',
        fileUrl: 'https://example.com/resources/math-g5-workbook.pdf',
        fileSize: 5242880, // 5MB
        subjectId: subjects[0].id,
        grade: 'Grade 5',
        tags: ['workbook', 'mathematics', 'exercises'],
        uploadedBy: teacher1.id,
      },
    }),
    prisma.libraryResource.create({
      data: {
        title: 'Khmer Reading Practice',
        titleKh: 'លំហាត់អានភាសាខ្មែរ',
        description: 'Collection of Khmer stories for reading practice',
        type: 'EBOOK',
        fileUrl: 'https://example.com/resources/khmer-stories.epub',
        fileSize: 2097152, // 2MB
        subjectId: subjects[1].id,
        grade: 'Grade 3',
        tags: ['reading', 'stories', 'khmer'],
        uploadedBy: teacher2.id,
      },
    }),
    prisma.libraryResource.create({
      data: {
        title: 'Science Experiment Guide',
        titleKh: 'មគ្គុទ្ទេសក៍ពិសោធន៍វិទ្យាសាស្ត្រ',
        description: 'Step-by-step guide for science experiments',
        type: 'GUIDE',
        fileUrl: 'https://example.com/resources/science-experiments.pdf',
        fileSize: 3145728, // 3MB
        subjectId: subjects[3].id,
        grade: 'Grade 4',
        tags: ['experiments', 'science', 'guide'],
        uploadedBy: teacher1.id,
      },
    }),
  ]);

  // Create Professional Development Courses
  console.log('🎓 Creating professional development courses...');
  const pdCourse1 = await prisma.professionalDevelopmentCourse.create({
    data: {
      title: 'Modern Teaching Methods',
      titleKh: 'វិធីសាស្ត្របង្រៀនទំនើប',
      description: 'Learn innovative teaching techniques for primary education',
      duration: 20, // 20 hours
      level: 'INTERMEDIATE',
      modules: {
        create: [
          {
            title: 'Introduction to Active Learning',
            titleKh: 'ការណែនាំអំពីការរៀនសកម្ម',
            content: {
              videos: ['intro-video-url'],
              texts: ['Active learning principles...'],
              activities: ['Group discussion activity'],
            },
            order: 1,
            duration: 90,
          },
          {
            title: 'Technology in the Classroom',
            titleKh: 'បច្ចេកវិទ្យាក្នុងថ្នាក់រៀន',
            content: {
              videos: ['tech-video-url'],
              texts: ['Using digital tools...'],
              activities: ['Create a digital lesson plan'],
            },
            order: 2,
            duration: 120,
          },
        ],
      },
      certificate: {
        create: {
          templateUrl: 'https://example.com/certificates/modern-teaching-template.pdf',
        },
      },
    },
    include: {
      modules: true,
      certificate: true,
    },
  });

  // Create Assessments
  console.log('📝 Creating assessments...');
  const assessment1 = await prisma.assessment.create({
    data: {
      title: 'Grade 5 Mathematics Mid-term',
      titleKh: 'ប្រឡងពាក់កណ្តាលឆមាសគណិតវិទ្យាថ្នាក់ទី៥',
      type: 'PROFICIENCY_TEST',
      grade: 'Grade 5',
      subjectId: subjects[0].id,
      duration: 60, // 60 minutes
      questions: {
        create: [
          {
            question: {
              type: 'multiple_choice',
              text: 'What is 456 + 789?',
              options: ['1245', '1235', '1255', '1225'],
            },
            correctAnswer: { index: 0 },
            points: 5,
            order: 1,
          },
          {
            question: {
              type: 'short_answer',
              text: 'Write 3/4 as a decimal',
            },
            correctAnswer: { value: '0.75' },
            points: 5,
            order: 2,
          },
        ],
      },
    },
  });

  const egraAssessment = await prisma.assessment.create({
    data: {
      title: 'EGRA - Khmer Reading Assessment',
      titleKh: 'ការវាយតម្លៃការអានភាសាខ្មែរ EGRA',
      type: 'EGRA',
      grade: 'Grade 2',
      subjectId: subjects[1].id,
      duration: 30,
      questions: {
        create: [
          {
            question: {
              type: 'letter_identification',
              text: 'Point to the letter ក',
              letters: ['ក', 'ខ', 'គ', 'ឃ'],
            },
            correctAnswer: { index: 0 },
            points: 1,
            order: 1,
          },
          {
            question: {
              type: 'word_reading',
              text: 'Read these words',
              words: ['មាន', 'ទៅ', 'មក', 'ធ្វើ'],
            },
            correctAnswer: { type: 'manual_scoring' },
            points: 4,
            order: 2,
          },
        ],
      },
    },
  });

  // Create Exercise Attempts
  console.log('📊 Creating exercise attempts...');
  for (const exercise of exercises.slice(0, 2)) {
    await prisma.exerciseAttempt.create({
      data: {
        userId: student1.id,
        exerciseId: exercise.id,
        answer: { userAnswer: exercise.content.correctAnswer },
        isCorrect: true,
        score: exercise.points,
        timeSpent: 120, // 2 minutes
        attempts: 1,
      },
    });
  }

  // Create Progress
  console.log('📈 Creating progress records...');
  await prisma.progress.create({
    data: {
      userId: student1.id,
      lessonId: mathLessons[0].id,
      completed: true,
      score: 85,
    },
  });

  await prisma.progress.create({
    data: {
      userId: student1.id,
      lessonId: mathLessons[1].id,
      completed: false,
      score: 60,
    },
  });

  // Create Video Progress
  console.log('🎬 Creating video progress...');
  await prisma.videoProgress.create({
    data: {
      userId: student1.id,
      videoId: videos[0].id,
      watchedSeconds: 300, // watched 5 minutes
      completed: false,
    },
  });

  // Create Forum Posts
  console.log('💬 Creating forum posts...');
  const forumPost1 = await prisma.forumPost.create({
    data: {
      authorId: student1.id,
      subject: subjects[0].code,
      title: 'Need help with fractions',
      content: 'Can someone explain how to add fractions with different denominators?',
      tags: ['fractions', 'help', 'math'],
      views: 25,
    },
  });

  const forumPost2 = await prisma.forumPost.create({
    data: {
      authorId: teacher1.id,
      subject: subjects[3].code,
      title: 'Fun Science Experiment Ideas',
      content: 'Here are some simple science experiments you can do at home with your children...',
      tags: ['science', 'experiments', 'activities'],
      views: 45,
      upvotes: 12,
    },
  });

  // Create Forum Answers
  await prisma.forumAnswer.create({
    data: {
      postId: forumPost1.id,
      authorId: teacher1.id,
      content: 'To add fractions with different denominators, first find the least common denominator...',
      upvotes: 5,
      accepted: true,
    },
  });

  // Create Notifications
  console.log('🔔 Creating notifications...');
  await prisma.notification.create({
    data: {
      userId: student1.id,
      type: 'ACHIEVEMENT_EARNED',
      title: 'New Achievement!',
      message: 'You earned the "Week Warrior" badge for a 7-day streak!',
      data: { badge: 'week-warrior', points: 50 },
    },
  });

  await prisma.notification.create({
    data: {
      userId: parent1.id,
      type: 'ASSIGNMENT_GRADED',
      title: 'Assignment Graded',
      message: 'Virak\'s mathematics assignment has been graded',
      data: { studentId: student1.id, subject: 'math', score: 85 },
    },
  });

  // Create Notification Preferences
  await prisma.notificationPreference.create({
    data: {
      userId: parent1.id,
      emailAssignments: true,
      emailGrades: true,
      emailAnnouncements: true,
      emailMessages: false,
      pushAssignments: true,
      pushGrades: true,
      pushAnnouncements: true,
      pushMessages: true,
      pushLiveClasses: true,
      inAppAll: true,
    },
  });

  // Create Teacher Enrollments in PD
  console.log('🎯 Creating PD enrollments...');
  await prisma.pDEnrollment.create({
    data: {
      teacherId: teacher1.id,
      courseId: pdCourse1.id,
      progress: 50,
    },
  });

  // Create Module Completion
  const modules = await prisma.pDModule.findMany({
    where: { courseId: pdCourse1.id },
    orderBy: { order: 'asc' },
  });

  if (modules.length > 0) {
    await prisma.pDModuleCompletion.create({
      data: {
        moduleId: modules[0].id,
        teacherId: teacher1.id,
      },
    });
  }

  // Create Resource Downloads
  console.log('📥 Creating resource downloads...');
  await prisma.resourceDownload.create({
    data: {
      userId: student1.id,
      resourceId: resources[0].id,
    },
  });

  // Create Assessment Attempt
  console.log('📋 Creating assessment attempts...');
  const assessmentAttempt = await prisma.assessmentAttempt.create({
    data: {
      userId: student1.id,
      assessmentId: assessment1.id,
      score: 8,
    },
  });

  const questions = await prisma.assessmentQuestion.findMany({
    where: { assessmentId: assessment1.id },
  });

  for (const question of questions) {
    await prisma.assessmentResponse.create({
      data: {
        attemptId: assessmentAttempt.id,
        questionId: question.id,
        answer: question.correctAnswer,
        isCorrect: true,
        timeSpent: 60,
      },
    });
  }

  // Create a Payment
  console.log('💳 Creating payment records...');
  await prisma.payment.create({
    data: {
      userId: parent1.id,
      amount: 5.00,
      currency: 'USD',
      status: 'SUCCEEDED',
      paymentMethod: 'card',
      paymentIntentId: 'pi_test_123456',
      description: 'Monthly subscription',
      metadata: {
        plan: 'premium',
        children: [student1.id, student2.id],
      },
    },
  });

  // Create Saved Posts
  console.log('💾 Creating saved posts...');
  await prisma.savedPost.create({
    data: {
      userId: student1.id,
      postId: forumPost2.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  
  // Print summary
  console.log('\n📊 Seed Summary:');
  console.log(`- Created ${subjects.length} subjects (including CALM and Social Studies)`);
  console.log(`- Created ${await prisma.user.count()} users`);
  console.log(`- Created ${await prisma.lesson.count()} lessons`);
  console.log(`- Created ${exercises.length} exercises`);
  console.log(`- Created ${videos.length} videos`);
  console.log(`- Created ${resources.length} library resources`);
  console.log('- Created professional development content');
  console.log('- Created assessments (including EGRA)');
  console.log('- Created user interactions (attempts, progress, forum posts)');
  
  console.log('\n🔑 Test Users:');
  console.log('Admin: admin@plp.edu.kh');
  console.log('Teacher 1: sokha.teacher@plp.edu.kh');
  console.log('Teacher 2: dara.teacher@plp.edu.kh');
  console.log('Parent: parent1@example.com');
  console.log('Student 1: virak.student@plp.edu.kh (Grade 5)');
  console.log('Student 2: sreymom.student@plp.edu.kh (Grade 3)');
  console.log('Student 3: kosal.student@plp.edu.kh (Grade 6)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });