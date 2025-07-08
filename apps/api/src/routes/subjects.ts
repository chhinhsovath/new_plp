import { Router } from "express";
import { authenticate } from "../middleware/auth";

export const subjectsRouter = Router();

// Public endpoint - no auth required
subjectsRouter.get("/", async (req, res) => {
  const subjects = [
    {
      id: "khmer",
      name: "Khmer",
      nameKh: "ភាសាខ្មែរ",
      icon: "🇰🇭",
      description: "Learn Khmer language, reading, and writing",
      grades: ["1", "2", "3", "4", "5", "6"],
    },
    {
      id: "math",
      name: "Mathematics",
      nameKh: "គណិតវិទ្យា",
      icon: "🔢",
      description: "Numbers, operations, and problem solving",
      grades: ["1", "2", "3", "4", "5", "6"],
    },
    {
      id: "english",
      name: "English",
      nameKh: "ភាសាអង់គ្លេស",
      icon: "🔤",
      description: "English language and communication",
      grades: ["1", "2", "3", "4", "5", "6"],
    },
    {
      id: "science",
      name: "Science",
      nameKh: "វិទ្យាសាស្ត្រ",
      icon: "🔬",
      description: "Explore the natural world",
      grades: ["1", "2", "3", "4", "5", "6"],
    },
  ];

  res.json(subjects);
});

// Get subject details with lessons - requires auth
subjectsRouter.get("/:subjectId", authenticate, async (req, res) => {
  const { subjectId } = req.params;
  const { grade } = req.query;

  // TODO: Fetch from database with Prisma
  // For now, return mock data based on subject
  const subjects: Record<string, any> = {
    math: {
      id: "math",
      code: "math",
      name: "Mathematics",
      nameKh: "គណិតវិទ្យា",
      icon: "🔢",
      lessons: [
        {
          id: "1",
          title: "Addition",
          titleKh: "ការបូក",
          description: "Learn to add numbers",
          grade: grade || "1",
          order: 1,
          duration: 30,
        },
        {
          id: "2",
          title: "Subtraction",
          titleKh: "ការដក",
          description: "Learn to subtract numbers",
          grade: grade || "1",
          order: 2,
          duration: 25,
        },
        {
          id: "3",
          title: "Multiplication",
          titleKh: "ការគុណ",
          description: "Learn to multiply numbers",
          grade: grade || "1",
          order: 3,
          duration: 35,
        },
      ],
    },
    khmer: {
      id: "khmer",
      code: "khmer",
      name: "Khmer",
      nameKh: "ភាសាខ្មែរ",
      icon: "🇰🇭",
      lessons: [
        {
          id: "1",
          title: "Khmer Alphabet",
          titleKh: "អក្សរខ្មែរ",
          description: "Learn the Khmer alphabet",
          grade: grade || "1",
          order: 1,
          duration: 40,
        },
        {
          id: "2",
          title: "Basic Words",
          titleKh: "ពាក្យមូលដ្ឋាន",
          description: "Learn basic Khmer words",
          grade: grade || "1",
          order: 2,
          duration: 30,
        },
      ],
    },
    english: {
      id: "english",
      code: "english",
      name: "English",
      nameKh: "ភាសាអង់គ្លេស",
      icon: "🔤",
      lessons: [
        {
          id: "1",
          title: "English Alphabet",
          titleKh: "អក្សរអង់គ្លេស",
          description: "Learn the English alphabet",
          grade: grade || "1",
          order: 1,
          duration: 30,
        },
        {
          id: "2",
          title: "Basic Greetings",
          titleKh: "ការស្វាគមន៍មូលដ្ឋាន",
          description: "Learn basic English greetings",
          grade: grade || "1",
          order: 2,
          duration: 25,
        },
      ],
    },
    science: {
      id: "science",
      code: "science",
      name: "Science",
      nameKh: "វិទ្យាសាស្ត្រ",
      icon: "🔬",
      lessons: [
        {
          id: "1",
          title: "Living Things",
          titleKh: "អ្វីដែលមានជីវិត",
          description: "Learn about living things",
          grade: grade || "1",
          order: 1,
          duration: 35,
        },
        {
          id: "2",
          title: "Plants",
          titleKh: "រុក្ខជាតិ",
          description: "Learn about plants",
          grade: grade || "1",
          order: 2,
          duration: 30,
        },
      ],
    },
  };

  const subject = subjects[subjectId];
  if (!subject) {
    return res.status(404).json({ error: "Subject not found" });
  }

  res.json(subject);
});