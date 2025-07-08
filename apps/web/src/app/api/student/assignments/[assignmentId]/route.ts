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

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check if student is enrolled in the class
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: params.assignmentId,
        class: {
          enrollments: {
            some: {
              studentId: user.id,
              status: "ACTIVE",
            },
          },
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
        exercises: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        resources: true,
        submissions: {
          where: {
            studentId: user.id,
          },
          select: {
            id: true,
            submittedAt: true,
            score: true,
            graded: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 404 }
      );
    }

    // Transform to include submission at assignment level
    const { submissions, ...rest } = assignment;
    const assignmentWithSubmission = {
      ...rest,
      submission: submissions[0] || null,
    };

    return NextResponse.json({
      assignment: assignmentWithSubmission,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}