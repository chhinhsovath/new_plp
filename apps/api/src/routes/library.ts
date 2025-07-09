import { Router } from "express";
import { z } from "zod";
import { prisma, ResourceType } from "@plp/database";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";


export const libraryRouter: Router = Router();

// Get all library resources with filters
const getResourcesSchema = z.object({
  query: z.object({
    type: z.nativeEnum(ResourceType).optional(),
    subject: z.string().optional(),
    grade: z.string().optional(),
    search: z.string().optional(),
    page: z.string().default("1").transform(Number),
    limit: z.string().default("20").transform(Number),
  }),
});

libraryRouter.get(
  "/resources",
  authenticate,
  validateRequest(getResourcesSchema),
  async (req, res) => {
    const validated = (req as any).validated;
    const { type, subject, grade, search, page, limit } = validated.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (subject) where.subjectId = subject;
    if (grade) where.grade = grade;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleKh: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [resources, total] = await Promise.all([
      prisma.libraryResource.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          subject: true,
        },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.libraryResource.count({ where }),
    ]);

    res.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// Get resource details
libraryRouter.get("/resources/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  
  const resource = await prisma.libraryResource.findUnique({
    where: { id },
    include: {
      subject: true,
    },
  });

  if (!resource) {
    return res.status(404).json({ error: "Resource not found" });
  }

  res.json(resource);
});

// Download resource (track download)
libraryRouter.post(
  "/resources/:id/download",
  authenticate,
  async (req, res) => {
    const { id } = req.params;

    // Check if resource exists
    const resource = await prisma.libraryResource.findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    // Track download
    await Promise.all([
      prisma.resourceDownload.create({
        data: {
          userId: req.userId!,
          resourceId: id,
        },
      }),
      prisma.libraryResource.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      }),
    ]);

    // Return download URL
    res.json({ downloadUrl: resource.fileUrl });
  }
);

// Get user's download history
libraryRouter.get(
  "/downloads",
  authenticate,
  async (req, res) => {
    const downloads = await prisma.resourceDownload.findMany({
      where: { userId: req.userId! },
      include: {
        resource: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { downloadedAt: "desc" },
      take: 50,
    });

    res.json(downloads);
  }
);

// Admin: Upload new resource
const uploadResourceSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    titleKh: z.string().optional(),
    description: z.string().optional(),
    type: z.nativeEnum(ResourceType),
    fileUrl: z.string().url(),
    fileSize: z.number().min(1),
    subjectId: z.string().optional(),
    grade: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

libraryRouter.post(
  "/resources",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  validateRequest(uploadResourceSchema),
  async (req, res) => {
    const resource = await prisma.libraryResource.create({
      data: {
        ...req.body,
        uploadedBy: req.userId!,
        tags: req.body.tags || [],
      },
      include: {
        subject: true,
      },
    });

    res.status(201).json(resource);
  }
);

// Admin: Update resource
const updateResourceSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    titleKh: z.string().optional(),
    description: z.string().optional(),
    type: z.nativeEnum(ResourceType).optional(),
    fileUrl: z.string().url().optional(),
    fileSize: z.number().min(1).optional(),
    subjectId: z.string().nullable().optional(),
    grade: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

libraryRouter.put(
  "/resources/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateResourceSchema),
  async (req, res) => {
    const { id } = req.params;

    const resource = await prisma.libraryResource.update({
      where: { id },
      data: req.body,
      include: {
        subject: true,
      },
    });

    res.json(resource);
  }
);

// Admin: Delete resource
libraryRouter.delete(
  "/resources/:id",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    const { id } = req.params;

    await prisma.libraryResource.delete({
      where: { id },
    });

    res.status(204).send();
  }
);

// Get resource types
libraryRouter.get("/resource-types", (_req, res) => {
  res.json(Object.values(ResourceType));
});