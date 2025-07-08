import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
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

    // Get assignment details
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: params.assignmentId,
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
        exercises: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        resources: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      assignment,
      enrollmentCount: assignment.class._count.enrollments,
    });
  } catch (error) {
    console.error("Error fetching assignment details:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
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

    // Check if assignment belongs to teacher
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id: params.assignmentId,
        class: {
          teacherId: user.id,
        },
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      instructions,
      dueDate,
      totalPoints,
    } = body;

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: params.assignmentId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(instructions !== undefined && { instructions }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(totalPoints !== undefined && { totalPoints }),
      },
    });

    return NextResponse.json({
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
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

    // Check if assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: params.assignmentId,
        class: {
          teacherId: user.id,
        },
      },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion if there are submissions
    if (assignment._count.submissions > 0) {
      return NextResponse.json(
        { error: "Cannot delete assignment with submissions" },
        { status: 400 }
      );
    }

    // Delete assignment (this will cascade delete exercises and resources)
    await prisma.assignment.delete({
      where: { id: params.assignmentId },
    });

    return NextResponse.json({
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}