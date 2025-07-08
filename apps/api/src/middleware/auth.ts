import { Request, Response, NextFunction } from "express";
import { requireAuth } from "@clerk/express";
import { AppError } from "./error-handler";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = requireAuth();

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
      throw new AppError(401, "Unauthorized");
    }

    if (roles.length > 0 && !roles.includes(req.userRole || "")) {
      throw new AppError(403, "Forbidden");
    }

    next();
  };
};