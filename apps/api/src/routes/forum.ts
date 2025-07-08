import { Router } from "express";
import { z } from "zod";
import { authenticate, AuthRequest } from "../middleware/auth";

export const forumRouter = Router();

forumRouter.use(authenticate);

// Create a new forum post
const createPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  subject: z.string(),
  tags: z.array(z.string()).optional(),
});

forumRouter.post("/posts", async (req: AuthRequest, res) => {
  const userId = req.userId;
  const data = createPostSchema.parse(req.body);

  // TODO: Save to database
  res.status(201).json({
    id: "new-post-id",
    ...data,
    authorId: userId,
    createdAt: new Date(),
    upvotes: 0,
    answers: 0,
  });
});

// Get forum posts
forumRouter.get("/posts", async (req, res) => {
  const { subject, search, page = 1, limit = 20 } = req.query;

  // TODO: Fetch from database
  const posts = [
    {
      id: "1",
      title: "How to solve quadratic equations?",
      content: "I'm having trouble understanding...",
      subject: "math",
      authorId: "user1",
      authorName: "John Doe",
      createdAt: new Date(),
      upvotes: 5,
      answers: 3,
      tags: ["algebra", "equations"],
    },
  ];

  res.json({
    posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: 100,
    },
  });
});

// Create answer
const createAnswerSchema = z.object({
  content: z.string().min(10),
});

forumRouter.post("/posts/:postId/answers", async (req: AuthRequest, res) => {
  const userId = req.userId;
  const { postId } = req.params;
  const data = createAnswerSchema.parse(req.body);

  // TODO: Save to database
  res.status(201).json({
    id: "new-answer-id",
    postId,
    ...data,
    authorId: userId,
    createdAt: new Date(),
    upvotes: 0,
  });
});