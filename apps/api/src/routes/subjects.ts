import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "@plp/database";

export const subjectsRouter: Router = Router();

// Public endpoint - no auth required
subjectsRouter.get("/", async (_req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        nameKh: true,
        icon: true,
        description: true,
      }
    });

    // Add grades array for compatibility
    const subjectsWithGrades = subjects.map(subject => ({
      ...subject,
      grades: ["1", "2", "3", "4", "5", "6"],
    }));

    res.json(subjectsWithGrades);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Get subject details with lessons - requires auth
subjectsRouter.get("/:subjectId", authenticate, async (req, res) => {
  const { subjectId } = req.params;
  const { grade } = req.query;

  try {
    // First try to fetch from database
    const subject = await prisma.subject.findFirst({
      where: { 
        OR: [
          { id: subjectId },
          { code: subjectId }
        ],
        active: true
      },
      include: {
        lessons: {
          where: grade ? { grade: grade as string } : {},
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            titleKh: true,
            description: true,
            grade: true,
            order: true,
            duration: true,
          }
        }
      }
    });

    if (subject) {
      res.json(subject);
      return;
    }

    // Fallback to mock data if not found in database
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

    const mockSubject = subjects[subjectId];
    if (!mockSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json(mockSubject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ error: "Failed to fetch subject" });
  }
});