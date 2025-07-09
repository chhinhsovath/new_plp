import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
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

    // Check if submission exists and belongs to teacher's assignment
    const submission = await prisma.submission.findFirst({
      where: {
        id: params.submissionId,
        assignment: {
          class: {
            teacherId: user.id,
          },
        },
      },
      include: {
        assignment: true,
        answers: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { score, feedback, answers } = body;

    // Start a transaction to update submission and answers
    const result = await prisma.$transaction(async (prisma) => {
      // Update submission with overall score and feedback
      const updatedSubmission = await prisma.submission.update({
        where: { id: params.submissionId },
        data: {
          score,
          feedback,
          graded: true,
          gradedAt: new Date(),
          gradedBy: user.id,
        },
      });

      // Update individual answer grades
      if (answers && answers.length > 0) {
        for (const answerGrade of answers) {
          const existingAnswer = submission.answers.find(
            (a) => a.exerciseId === answerGrade.exerciseId
          );

          if (existingAnswer) {
            await prisma.submissionAnswer.update({
              where: { id: existingAnswer.id },
              data: {
                points: answerGrade.points,
                isCorrect: answerGrade.isCorrect,
                feedback: answerGrade.feedback,
              },
            });
          }
        }
      }

      // Create or update grade record
      const existingGrade = await prisma.grade.findFirst({
        where: {
          studentId: submission.studentId,
          assignmentId: submission.assignmentId,
        },
      });

      if (existingGrade) {
        await prisma.grade.update({
          where: { id: existingGrade.id },
          data: {
            score,
            feedback,
          },
        });
      } else {
        await prisma.grade.create({
          data: {
            studentId: submission.studentId,
            assignmentId: submission.assignmentId,
            score,
            feedback,
          },
        });
      }

      return updatedSubmission;
    });

    return NextResponse.json({
      submission: result,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}