import { Router } from "express";
import { z } from "zod";
import { prisma, PDLevel } from "@plp/database";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";


export const pdRouter: Router = Router();

// Get all PD courses
const getCoursesSchema = z.object({
  query: z.object({
    level: z.nativeEnum(PDLevel).optional(),
    search: z.string().optional(),
    page: z.string().default("1").transform(Number),
    limit: z.string().default("20").transform(Number),
  }),
});

pdRouter.get(
  "/courses",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  validateRequest(getCoursesSchema),
  async (req, res) => {
    const validated = (req as any).validated;
    const { level, search, page, limit } = validated.query;
    
    const where: any = {};
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleKh: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.professionalDevelopmentCourse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.professionalDevelopmentCourse.count({ where }),
    ]);

    // Add enrollment status for current teacher
    const enrollments = await prisma.pDEnrollment.findMany({
      where: {
        teacherId: req.userId!,
        courseId: { in: courses.map(c => c.id) },
      },
    });

    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      isEnrolled: enrollments.some(e => e.courseId === course.id),
      enrollmentProgress: enrollments.find(e => e.courseId === course.id)?.progress || 0,
    }));

    res.json({
      courses: coursesWithEnrollment,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// Get course details with modules
pdRouter.get(
  "/courses/:id",
  authenticate,
  authorize("TEACHER", "ADMIN"),
  async (req, res) => {
    const { id } = req.params;
    
    const course = await prisma.professionalDevelopmentCourse.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: "asc" },
        },
        certificate: true,
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Get enrollment status
    const enrollment = await prisma.pDEnrollment.findUnique({
      where: {
        teacherId_courseId: {
          teacherId: req.userId!,
          courseId: id,
        },
      },
    });

    // Get module completions
    const completions = await prisma.pDModuleCompletion.findMany({
      where: {
        teacherId: req.userId!,
        moduleId: { in: course.modules.map(m => m.id) },
      },
    });

    const modulesWithCompletion = course.modules.map(module => ({
      ...module,
      isCompleted: completions.some(c => c.moduleId === module.id),
    }));

    res.json({
      ...course,
      modules: modulesWithCompletion,
      enrollment,
    });
  }
);

// Enroll in a course
pdRouter.post(
  "/courses/:id/enroll",
  authenticate,
  authorize("TEACHER"),
  async (req, res) => {
    const { id } = req.params;

    const enrollment = await prisma.pDEnrollment.create({
      data: {
        teacherId: req.userId!,
        courseId: id,
      },
    });

    res.status(201).json(enrollment);
  }
);

// Complete a module
pdRouter.post(
  "/modules/:id/complete",
  authenticate,
  authorize("TEACHER"),
  async (req, res) => {
    const { id } = req.params;

    // Get module details to find course
    const module = await prisma.pDModule.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Check enrollment
    const enrollment = await prisma.pDEnrollment.findUnique({
      where: {
        teacherId_courseId: {
          teacherId: req.userId!,
          courseId: module.courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    // Mark module as completed
    const completion = await prisma.pDModuleCompletion.create({
      data: {
        moduleId: id,
        teacherId: req.userId!,
      },
    });

    // Update course progress
    const totalModules = await prisma.pDModule.count({
      where: { courseId: module.courseId },
    });

    const completedModules = await prisma.pDModuleCompletion.count({
      where: {
        teacherId: req.userId!,
        module: { courseId: module.courseId },
      },
    });

    const progress = (completedModules / totalModules) * 100;

    await prisma.pDEnrollment.update({
      where: {
        teacherId_courseId: {
          teacherId: req.userId!,
          courseId: module.courseId,
        },
      },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    // Issue certificate if course completed
    if (progress === 100) {
      const certificate = await prisma.pDCertificate.findUnique({
        where: { courseId: module.courseId },
      });

      if (certificate) {
        await prisma.pDIssuedCertificate.create({
          data: {
            certificateId: certificate.id,
            teacherId: req.userId!,
            certificateUrl: `generated-certificate-url-${req.userId}-${certificate.id}`, // TODO: Generate actual certificate
          },
        });
      }
    }

    res.json({ completion, progress });
  }
);

// Get teacher's enrollments
pdRouter.get(
  "/enrollments",
  authenticate,
  authorize("TEACHER"),
  async (req, res) => {
    const enrollments = await prisma.pDEnrollment.findMany({
      where: { teacherId: req.userId! },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    res.json(enrollments);
  }
);

// Get teacher's certificates
pdRouter.get(
  "/certificates",
  authenticate,
  authorize("TEACHER"),
  async (req, res) => {
    const certificates = await prisma.pDIssuedCertificate.findMany({
      where: { teacherId: req.userId! },
      include: {
        certificate: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    res.json(certificates);
  }
);

// Admin: Create new course
const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    titleKh: z.string().optional(),
    description: z.string(),
    duration: z.number().min(1),
    level: z.nativeEnum(PDLevel),
  }),
});

pdRouter.post(
  "/courses",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createCourseSchema),
  async (req, res) => {
    const course = await prisma.professionalDevelopmentCourse.create({
      data: req.body,
    });

    res.status(201).json(course);
  }
);

// Admin: Create module
const createModuleSchema = z.object({
  body: z.object({
    courseId: z.string(),
    title: z.string().min(1),
    titleKh: z.string().optional(),
    content: z.any(), // JSON content
    order: z.number().min(0),
    duration: z.number().min(1),
  }),
});

pdRouter.post(
  "/modules",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createModuleSchema),
  async (req, res) => {
    const module = await prisma.pDModule.create({
      data: req.body,
    });

    res.status(201).json(module);
  }
);

// Admin: Create certificate template
const createCertificateSchema = z.object({
  body: z.object({
    courseId: z.string(),
    templateUrl: z.string().url(),
  }),
});

pdRouter.post(
  "/certificates",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createCertificateSchema),
  async (req, res) => {
    const certificate = await prisma.pDCertificate.create({
      data: req.body,
    });

    res.status(201).json(certificate);
  }
);