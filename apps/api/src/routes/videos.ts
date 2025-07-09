import { Router } from "express";
import { z } from "zod";
import { prisma } from "@plp/database";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";


export const videosRouter: Router = Router();

// Get all videos with filters
const getVideosSchema = z.object({
  query: z.object({
    subject: z.string().optional(),
    grade: z.string().optional(),
    lessonId: z.string().optional(),
    search: z.string().optional(),
    page: z.string().default("1").transform(Number),
    limit: z.string().default("20").transform(Number),
  }),
});

videosRouter.get(
  "/",
  authenticate,
  validateRequest(getVideosSchema),
  async (req, res) => {
    const { query } = (req as any).validated;
    const { subject, grade, lessonId, search, page, limit } = query;
    
    const where: any = {};
    if (subject) where.subjectId = subject;
    if (grade) where.grade = grade;
    if (lessonId) where.lessonId = lessonId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleKh: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip: ((page as number) - 1) * (limit as number),
        take: limit as number,
        include: {
          subject: true,
          lesson: true,
        },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.video.count({ where }),
    ]);

    res.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / (limit as number)),
      },
    });
  }
);

// Get video details
videosRouter.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      subject: true,
      lesson: true,
      videoProgress: {
        where: { userId: req.userId! },
      },
    },
  });

  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  // Increment view count
  await prisma.video.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  res.json(video);
});

// Update video progress
const updateProgressSchema = z.object({
  body: z.object({
    watchedSeconds: z.number().min(0),
    completed: z.boolean().optional(),
  }),
});

videosRouter.post(
  "/:id/progress",
  authenticate,
  validateRequest(updateProgressSchema),
  async (req, res) => {
    const { id } = req.params;
    const { watchedSeconds, completed } = req.body;

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: req.userId!,
          videoId: id,
        },
      },
      create: {
        userId: req.userId!,
        videoId: id,
        watchedSeconds,
        completed: completed || false,
      },
      update: {
        watchedSeconds,
        completed: completed !== undefined ? completed : undefined,
      },
    });

    res.json(progress);
  }
);

// Get recommended videos
videosRouter.get(
  "/recommended",
  authenticate,
  async (req, res) => {
    // Simple recommendation: videos from subjects the user has interacted with
    const userProgress = await prisma.videoProgress.findMany({
      where: { userId: req.userId! },
      include: { video: true },
      take: 10,
    });

    const subjectIds = [...new Set(userProgress.map(p => p.video.subjectId))];

    const recommended = await prisma.video.findMany({
      where: {
        subjectId: { in: subjectIds },
        id: { notIn: userProgress.map(p => p.videoId) },
      },
      take: 10,
      orderBy: { views: "desc" },
      include: {
        subject: true,
        lesson: true,
      },
    });

    res.json(recommended);
  }
);

// Admin: Upload new video
const uploadVideoSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    titleKh: z.string().optional(),
    description: z.string().optional(),
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    duration: z.number().min(1),
    subjectId: z.string(),
    grade: z.string(),
    lessonId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    transcriptUrl: z.string().url().optional(),
  }),
});

videosRouter.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest(uploadVideoSchema),
  async (req, res) => {
    const video = await prisma.video.create({
      data: {
        ...req.body,
        uploadedBy: req.userId!,
        tags: req.body.tags || [],
      },
      include: {
        subject: true,
        lesson: true,
      },
    });

    res.status(201).json(video);
  }
);

// Admin: Update video
const updateVideoSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    titleKh: z.string().optional(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    duration: z.number().min(1).optional(),
    subjectId: z.string().optional(),
    grade: z.string().optional(),
    lessonId: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    transcriptUrl: z.string().url().nullable().optional(),
  }),
});

videosRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateVideoSchema),
  async (req, res) => {
    const { id } = req.params;

    const video = await prisma.video.update({
      where: { id },
      data: req.body,
      include: {
        subject: true,
        lesson: true,
      },
    });

    res.json(video);
  }
);

// Admin: Delete video
videosRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const { id } = req.params;

    await prisma.video.delete({
      where: { id },
    });

    res.status(204).send();
  }
);