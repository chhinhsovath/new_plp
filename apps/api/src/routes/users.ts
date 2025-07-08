import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const usersRouter = Router();

// All user routes require authentication
usersRouter.use(authenticate);

// Get current user profile
usersRouter.get("/me", async (req: AuthRequest, res) => {
  const userId = req.userId;
  
  // TODO: Fetch from database
  const user = {
    id: userId,
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "student",
    grade: "5",
    parentId: null,
  };

  res.json(user);
});

// Update user profile
const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  grade: z.string().optional(),
  preferredLanguage: z.enum(["km", "en"]).optional(),
});

usersRouter.put("/me", async (req: AuthRequest, res) => {
  const userId = req.userId;
  const data = updateProfileSchema.parse(req.body);

  // TODO: Update in database
  res.json({
    message: "Profile updated successfully",
    user: { id: userId, ...data },
  });
});

// Parent-specific routes
usersRouter.get("/children", authorize("parent"), async (req: AuthRequest, res) => {
  const parentId = req.userId;

  // TODO: Fetch from database
  const children = [
    {
      id: "child1",
      firstName: "Jane",
      lastName: "Doe",
      grade: "3",
      email: "jane@example.com",
    },
  ];

  res.json(children);
});

// Add child account (parent only)
const addChildSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  grade: z.string(),
  username: z.string(),
  password: z.string().min(6),
});

usersRouter.post("/children", authorize("parent"), async (req: AuthRequest, res) => {
  const parentId = req.userId;
  const data = addChildSchema.parse(req.body);

  // TODO: Create child account in database
  res.status(201).json({
    message: "Child account created successfully",
    child: {
      id: "new-child-id",
      ...data,
      parentId,
    },
  });
});