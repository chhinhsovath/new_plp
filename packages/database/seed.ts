import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: "khmer" },
      update: {},
      create: {
        code: "khmer",
        name: "Khmer",
        nameKh: "ភាសាខ្មែរ",
        description: "Learn Khmer language, reading, and writing",
        icon: "🇰🇭",
        order: 1,
      },
    }),
    prisma.subject.upsert({
      where: { code: "math" },
      update: {},
      create: {
        code: "math",
        name: "Mathematics",
        nameKh: "គណិតវិទ្យា",
        description: "Numbers, operations, and problem solving",
        icon: "🔢",
        order: 2,
      },
    }),
    prisma.subject.upsert({
      where: { code: "english" },
      update: {},
      create: {
        code: "english",
        name: "English",
        nameKh: "ភាសាអង់គ្លេស",
        description: "English language and communication",
        icon: "🔤",
        order: 3,
      },
    }),
    prisma.subject.upsert({
      where: { code: "science" },
      update: {},
      create: {
        code: "science",
        name: "Science",
        nameKh: "វិទ្យាសាស្ត្រ",
        description: "Explore the natural world",
        icon: "🔬",
        order: 4,
      },
    }),
  ]);

  console.log("Created subjects:", subjects.map((s) => s.name).join(", "));

  // Create sample lessons for Math
  const mathSubject = subjects.find((s) => s.code === "math")!;
  
  const mathLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        subjectId: mathSubject.id,
        title: "Addition",
        titleKh: "ការបូក",
        description: "Learn to add numbers",
        grade: "1",
        order: 1,
        duration: 30,
      },
    }),
    prisma.lesson.create({
      data: {
        subjectId: mathSubject.id,
        title: "Subtraction",
        titleKh: "ការដក",
        description: "Learn to subtract numbers",
        grade: "1",
        order: 2,
        duration: 30,
      },
    }),
  ]);

  console.log("Created math lessons:", mathLessons.map((l) => l.title).join(", "));

  // Create sample exercises
  const additionLesson = mathLessons[0];
  
  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        subjectId: mathSubject.id,
        lessonId: additionLesson.id,
        type: "MULTIPLE_CHOICE",
        title: "Simple Addition",
        titleKh: "ការបូកសាមញ្ញ",
        instructions: "Choose the correct answer",
        content: {
          question: "What is 2 + 3?",
          options: ["4", "5", "6", "7"],
        },
        solution: {
          correctAnswer: 1,
          explanation: "2 + 3 = 5",
        },
        difficulty: "EASY",
        grade: "1",
        points: 10,
      },
    }),
    prisma.exercise.create({
      data: {
        subjectId: mathSubject.id,
        lessonId: additionLesson.id,
        type: "FILL_IN_GAPS",
        title: "Fill the Missing Number",
        titleKh: "បំពេញលេខដែលខ្វះ",
        instructions: "Fill in the missing number",
        content: {
          question: "3 + ___ = 7",
          gaps: [{ id: "gap1", position: 1 }],
        },
        solution: {
          gap1: "4",
        },
        difficulty: "MEDIUM",
        grade: "1",
        points: 15,
      },
    }),
  ]);

  console.log("Created exercises:", exercises.map((e) => e.title).join(", "));

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });