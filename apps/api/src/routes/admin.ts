import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

export const adminRouter: Router = Router();

// All admin routes require admin role
adminRouter.use(authenticate);
adminRouter.use(authorize("admin"));

// Dashboard stats
adminRouter.get("/stats", async (_req, res) => {
  // TODO: Fetch from database
  const stats = {
    totalUsers: 15420,
    activeUsers: 8234,
    totalExercises: 2450,
    completedExercises: 125000,
    revenue: {
      monthly: 5420,
      yearly: 64200,
    },
    growth: {
      users: 12.5, // percentage
      revenue: 8.3,
    },
  };

  res.json(stats);
});

// User management
adminRouter.get("/users", async (req, res) => {
  const { page = 1, limit = 20, search: _search, role: _role } = req.query;

  // TODO: Fetch from database
  const users = [
    {
      id: "1",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "student",
      createdAt: new Date(),
      lastActive: new Date(),
    },
  ];

  res.json({
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: 1000,
    },
  });
});

// Content management
adminRouter.get("/content/exercises", async (_req, res) => {
  // const { subject, type, status } = req.query; // TODO: Use for filtering

  // TODO: Fetch from database
  const exercises = [
    {
      id: "1",
      title: "Addition Practice",
      subject: "math",
      type: "fill-in-gaps",
      status: "published",
      createdAt: new Date(),
      views: 1250,
      completions: 980,
    },
  ];

  res.json(exercises);
});