import { Response, NextFunction, Request, RequestHandler } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { AppError } from "./error-handler";
import { prisma } from "@plp/database";

// Extend the Express Request interface to include our custom properties
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// requireAuth is already a middleware function from @clerk/express
// It ensures the request has a valid auth object with a userId
export const authenticate: RequestHandler = requireAuth;

// Helper middleware to enrich request with user data
export const enrichUserData = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    
    if (!auth.userId) {
      throw new AppError(401, "Unauthorized");
    }

    // Set userId on request for backward compatibility
    req.userId = auth.userId;
    
    // Fetch user role from database
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId },
      select: { role: true }
    });
    
    if (user) {
      req.userRole = user.role;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // If userId and userRole aren't set, enrich the data
      if (!req.userId || !req.userRole) {
        await enrichUserData(req, res, () => {});
      }
      
      if (!req.userId) {
        throw new AppError(401, "Unauthorized");
      }

      if (roles.length > 0 && !roles.includes(req.userRole || "")) {
        throw new AppError(403, "Forbidden - insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};