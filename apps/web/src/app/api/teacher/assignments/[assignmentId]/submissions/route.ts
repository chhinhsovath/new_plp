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

    // Check if assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: params.assignmentId,
        class: {
          teacherId: user.id,
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Get all submissions for the assignment
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: params.assignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        answers: {
          select: {
            exerciseId: true,
            answer: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json({
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}