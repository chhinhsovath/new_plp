import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get all assignments for teacher's classes
    const assignments = await prisma.assignment.findMany({
      where: {
        class: {
          teacherId: user.id,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: "ACTIVE",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
            exercises: true,
            resources: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to include enrollment count at assignment level
    const assignmentsWithEnrollment = assignments.map((assignment) => ({
      ...assignment,
      classEnrollmentCount: assignment.class._count.enrollments,
    }));

    return NextResponse.json({
      assignments: assignmentsWithEnrollment,
    });
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      classId,
      type,
      instructions,
      dueDate,
      totalPoints,
      exercises,
      resources,
    } = body;

    // Validate required fields
    if (!title || !classId || !dueDate || !exercises || exercises.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify class belongs to teacher
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: user.id,
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create assignment with exercises and resources
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type,
        instructions,
        classId,
        dueDate: new Date(dueDate),
        totalPoints,
        exercises: {
          create: exercises.map((exercise: any, index: number) => ({
            type: exercise.type,
            question: exercise.question,
            points: exercise.points,
            orderIndex: index,
            data: exercise.data,
          })),
        },
        resources: {
          create: resources?.map((resource: any) => ({
            type: resource.type,
            name: resource.name,
            url: resource.url,
          })) || [],
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                name: true,
              },
            },
          },
        },
        exercises: true,
        resources: true,
      },
    });

    // Trigger notification for new assignment
    if (assignment.status === "PUBLISHED") {
      const { NotificationTriggers } = await import("@/lib/notifications");
      await NotificationTriggers.assignmentCreated(
        assignment.classId,
        assignment.id,
        assignment.title
      );
    }

    return NextResponse.json({
      assignment,
    });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}