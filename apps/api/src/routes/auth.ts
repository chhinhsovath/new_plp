import { Router } from "express";
import { z } from "zod";


export const authRouter: Router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["student", "parent", "teacher", "admin"]),
  parentId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// These endpoints work with Clerk authentication on the frontend
authRouter.post("/register", async (req, res) => {
  const _data = registerSchema.parse(req.body);
  
  // Here you would typically:
  // 1. Create user in your database
  // 2. Send welcome email
  // 3. Return success response
  // Note: Actual auth is handled by Clerk on frontend
  
  res.json({
    message: "Registration successful",
    user: {
      email: _data.email,
      role: _data.role,
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const _data = loginSchema.parse(req.body);
  
  // Login is handled by Clerk on frontend
  // This endpoint might be used for custom login flows
  
  res.json({
    message: "Login endpoint - use Clerk authentication",
  });
});

authRouter.post("/logout", async (_req, res) => {
  // Logout is handled by Clerk on frontend
  res.json({
    message: "Logout successful",
  });
});