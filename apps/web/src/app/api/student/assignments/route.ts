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

    if (!user || user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get all assignments for classes the student is enrolled in
    const assignments = await prisma.assignment.findMany({
      where: {
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
        _count: {
          select: {
            exercises: true,
            resources: true,
          },
        },
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
      orderBy: {
        dueDate: "asc",
      },
    });

    // Transform to include submission at assignment level
    const assignmentsWithSubmission = assignments.map((assignment) => {
      const { submissions, ...rest } = assignment;
      return {
        ...rest,
        submission: submissions[0] || null,
      };
    });

    return NextResponse.json({
      assignments: assignmentsWithSubmission,
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}