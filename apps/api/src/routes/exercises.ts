import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";


export const exercisesRouter: Router = Router();

// All exercise routes require authentication
exercisesRouter.use(authenticate);

// Get exercises by subject and type
exercisesRouter.get("/:subject/:type", async (req, res) => {
  const { subject, type } = req.params;
  const { grade, difficulty, limit: _limit = 10 } = req.query;

  // TODO: Fetch from database
  const exercises = [
    {
      id: "1",
      subject,
      type,
      title: "Sample Exercise",
      content: {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
      },
      difficulty: difficulty || "easy",
      grade: grade || "1",
    },
  ];

  res.json(exercises);
});

// Submit exercise answer
const submitAnswerSchema = z.object({
  exerciseId: z.string(),
  answer: z.any(),
  timeSpent: z.number(),
});

exercisesRouter.post("/:exerciseId/submit", async (req, res) => {
  const { exerciseId } = req.params;
  const _data = submitAnswerSchema.parse(req.body);

  // TODO: Validate answer and save to database
  const isCorrect = true; // Placeholder
  const score = isCorrect ? 100 : 0;

  res.json({
    correct: isCorrect,
    score,
    exerciseId,
    feedback: isCorrect ? "Great job!" : "Try again!",
  });
});

// Get exercise solution
exercisesRouter.get("/:exerciseId/solution", async (req, res) => {
  const { exerciseId } = req.params;

  // TODO: Fetch from database
  res.json({
    exerciseId,
    solution: {
      answer: "4",
      explanation: "2 + 2 equals 4",
      steps: ["Add 2 to 2", "The result is 4"],
    },
  });
});