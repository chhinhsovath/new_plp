import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import { clerkMiddleware } from "@clerk/express";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { subjectsRouter } from "./routes/subjects";
import { exercisesRouter } from "./routes/exercises";
import { progressRouter } from "./routes/progress";
import { forumRouter } from "./routes/forum";
import { paymentsRouter } from "./routes/payments";
import { adminRouter } from "./routes/admin";
import { videosRouter } from "./routes/videos";
import { libraryRouter } from "./routes/library";
import { pdRouter } from "./routes/professional-development";
import { assessmentsRouter } from "./routes/assessments";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  },
});

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use("/api", limiter);

// Clerk authentication middleware - must be before any authenticated routes
app.use(clerkMiddleware());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/exercises", exercisesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/forum", forumRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/videos", videosRouter);
app.use("/api/library", libraryRouter);
app.use("/api/pd", pdRouter);
app.use("/api/assessments", assessmentsRouter);

// Socket.io handlers
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("exercise-progress", (data) => {
    socket.to(data.roomId).emit("student-progress", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});