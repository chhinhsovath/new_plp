import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

export const progressRouter = Router();

progressRouter.use(authenticate);

// Get user progress
progressRouter.get("/", async (req: AuthRequest, res) => {
  const userId = req.userId;
  const { subject, startDate, endDate } = req.query;

  // TODO: Fetch from database
  const progress = {
    userId,
    overall: {
      exercisesCompleted: 150,
      totalScore: 8500,
      averageScore: 85,
      timeSpent: 3600, // seconds
      streak: 7, // days
    },
    subjects: [
      {
        id: "math",
        name: "Mathematics",
        progress: 75,
        exercisesCompleted: 50,
        averageScore: 88,
      },
      {
        id: "english",
        name: "English",
        progress: 60,
        exercisesCompleted: 40,
        averageScore: 82,
      },
    ],
  };

  res.json(progress);
});

// Get detailed progress for a subject
progressRouter.get("/:subject", async (req: AuthRequest, res) => {
  const userId = req.userId;
  const { subject } = req.params;

  // TODO: Fetch from database
  const subjectProgress = {
    subject,
    lessons: [
      {
        id: "1",
        title: "Addition",
        completed: true,
        score: 95,
        exercises: 15,
        completedExercises: 15,
      },
      {
        id: "2",
        title: "Subtraction",
        completed: false,
        score: 0,
        exercises: 12,
        completedExercises: 5,
      },
    ],
  };

  res.json(subjectProgress);
});