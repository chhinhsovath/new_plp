import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";
import { NotificationTriggers } from "@/lib/notifications";

export async function PUT(
  request: NextRequest,
  { params }: { params: { assignmentId: string; submissionId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Verify submission exists and teacher has access
    const submission = await prisma.assignmentSubmission.findFirst({
      where: {
        id: params.submissionId,
        assignmentId: params.assignmentId,
        assignment: {
          class: {
            teacherId: user.id,
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

    const body = await request.json();
    const { score, feedback } = body;

    // Update submission with grade
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: {
        id: params.submissionId,
      },
      data: {
        score,
        feedback,
        graded: true,
        gradedBy: user.id,
        gradedAt: new Date(),
      },
    });

    // Trigger notification
    await NotificationTriggers.assignmentGraded(params.submissionId);

    return NextResponse.json({
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}