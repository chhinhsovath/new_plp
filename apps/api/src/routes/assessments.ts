import { Router } from "express";
import { z } from "zod";
import { prisma, AssessmentType } from "@plp/database";
import { authenticate, authorize, enrichUserData } from "../middleware/auth";
import { getAuth } from "@clerk/express";
import { validateRequest } from "../middleware/validation";

export const assessmentsRouter: Router = Router();

// Apply authentication and user data enrichment for all routes
assessmentsRouter.use(authenticate);
assessmentsRouter.use(enrichUserData);

// Get all assessments
const getAssessmentsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(AssessmentType).optional(),
    grade: z.string().optional(),
    subjectId: z.string().optional(),
    page: z.string().default("1").transform(Number),
    limit: z.string().default("20").transform(Number),
  }),
});

assessmentsRouter.get(
  "/",
  authenticate,
  validateRequest(getAssessmentsSchema),
  async (req, res) => {
    const validated = (req as any).validated;
    const { type, grade, subjectId, page, limit } = validated.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (grade) where.grade = grade;
    if (subjectId) where.subjectId = subjectId;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          subject: true,
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.assessment.count({ where }),
    ]);

    // Get user's attempts
    const userAttempts = await prisma.assessmentAttempt.findMany({
      where: {
        userId: getAuth(req).userId!,
        assessmentId: { in: assessments.map(a => a.id) },
      },
    });

    const assessmentsWithAttempts = assessments.map(assessment => ({
      ...assessment,
      userAttempts: userAttempts.filter(a => a.assessmentId === assessment.id),
      hasAttempted: userAttempts.some(a => a.assessmentId === assessment.id),
    }));

    res.json({
      assessments: assessmentsWithAttempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// Get assessment details with questions
assessmentsRouter.get(
  "/:id",
  async (req, res) => {
    const { id } = req.params;
    
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Get user's attempts
    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        userId: getAuth(req).userId!,
        assessmentId: id,
      },
      orderBy: { startedAt: "desc" },
    });

    res.json({
      ...assessment,
      attempts,
    });
  }
);

// Start assessment attempt
assessmentsRouter.post(
  "/:id/start",
  authenticate,
  async (req, res) => {
    const { id } = req.params;

    // Check if assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Check for ongoing attempt
    const ongoingAttempt = await prisma.assessmentAttempt.findFirst({
      where: {
        userId: getAuth(req).userId!,
        assessmentId: id,
        completedAt: null,
      },
    });

    if (ongoingAttempt) {
      return res.json(ongoingAttempt);
    }

    // Create new attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId: getAuth(req).userId!,
        assessmentId: id,
      },
    });

    res.status(201).json({
      attempt,
      questions: assessment.questions.map(q => ({
        id: q.id,
        question: q.question,
        order: q.order,
        points: q.points,
      })),
    });
  }
);

// Submit answer for a question
const submitAnswerSchema = z.object({
  body: z.object({
    answer: z.any(), // Flexible answer format
    timeSpent: z.number().min(0),
  }),
});

assessmentsRouter.post(
  "/attempts/:attemptId/questions/:questionId/answer",
  authenticate,
  validateRequest(submitAnswerSchema),
  async (req, res) => {
    const { attemptId, questionId } = req.params;
    const { answer, timeSpent } = req.body;

    // Verify attempt belongs to user
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId: getAuth(req).userId!,
        completedAt: null,
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Active attempt not found" });
    }

    // Get question details
    const question = await prisma.assessmentQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question || question.assessmentId !== attempt.assessmentId) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Check answer correctness (simplified - in reality would be more complex)
    const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correctAnswer);

    // Save response
    const response = await prisma.assessmentResponse.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      create: {
        attemptId,
        questionId,
        answer,
        isCorrect,
        timeSpent,
      },
      update: {
        answer,
        isCorrect,
        timeSpent,
      },
    });

    res.json(response);
  }
);

// Complete assessment
assessmentsRouter.post(
  "/attempts/:attemptId/complete",
  authenticate,
  async (req, res) => {
    const { attemptId } = req.params;

    // Verify attempt belongs to user
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId: getAuth(req).userId!,
        completedAt: null,
      },
      include: {
        assessment: {
          include: { questions: true },
        },
        responses: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: "Active attempt not found" });
    }

    // Calculate score
    const totalPoints = attempt.assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = attempt.responses
      .filter(r => r.isCorrect)
      .reduce((sum, r) => {
        const question = attempt.assessment.questions.find(q => q.id === r.questionId);
        return sum + (question?.points || 0);
      }, 0);

    const score = (earnedPoints / totalPoints) * 100;

    // Update attempt
    const completedAttempt = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: new Date(),
        score,
      },
      include: {
        responses: true,
      },
    });

    res.json({
      ...completedAttempt,
      totalPoints,
      earnedPoints,
    });
  }
);

// Get user's assessment history
assessmentsRouter.get(
  "/history",
  authenticate,
  async (req, res) => {
    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        userId: getAuth(req).userId!,
        completedAt: { not: null },
      },
      include: {
        assessment: {
          include: { subject: true },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 50,
    });

    res.json(attempts);
  }
);

// Admin: Create assessment
const createAssessmentSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    titleKh: z.string().optional(),
    type: z.nativeEnum(AssessmentType),
    grade: z.string(),
    subjectId: z.string().optional(),
    duration: z.number().min(1),
  }),
});

assessmentsRouter.post(
  "/",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  validateRequest(createAssessmentSchema),
  async (req, res) => {
    const assessment = await prisma.assessment.create({
      data: req.body,
    });

    res.status(201).json(assessment);
  }
);

// Admin: Add question to assessment
const createQuestionSchema = z.object({
  body: z.object({
    assessmentId: z.string(),
    question: z.any(), // Flexible question format
    correctAnswer: z.any(),
    points: z.number().min(1),
    order: z.number().min(0),
  }),
});

assessmentsRouter.post(
  "/questions",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  validateRequest(createQuestionSchema),
  async (req, res) => {
    const question = await prisma.assessmentQuestion.create({
      data: req.body,
    });

    res.status(201).json(question);
  }
);

// Get EGRA-specific assessments
assessmentsRouter.get(
  "/egra",
  authenticate,
  async (_req, res) => {
    const egraAssessments = await prisma.assessment.findMany({
      where: { type: "EGRA" },
      include: {
        subject: true,
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { grade: "asc" },
    });

    res.json(egraAssessments);
  }
);