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

    // Get submission for this assignment
    const submission = await prisma.submission.findFirst({
      where: {
        assignmentId: params.assignmentId,
        studentId: user.id,
      },
      include: {
        assignment: {
          include: {
            class: {
              select: {
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
          },
        },
        answers: {
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      submission,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}