import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function POST(
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

    // Check if student is enrolled in the class and hasn't already submitted
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
        exercises: true,
        submissions: {
          where: {
            studentId: user.id,
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

    if (assignment.submissions.length > 0) {
      return NextResponse.json(
        { error: "Assignment already submitted" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid submission data" },
        { status: 400 }
      );
    }

    // Create submission with answers
    const submission = await prisma.submission.create({
      data: {
        assignmentId: params.assignmentId,
        studentId: user.id,
        submittedAt: new Date(),
        graded: false,
        answers: {
          create: answers.map((answer: any) => ({
            exerciseId: answer.exerciseId,
            answer: answer.answer,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Auto-grade objective questions
    let totalAutoGraded = 0;
    const updatedAnswers = [];

    for (const answer of submission.answers) {
      const exercise = assignment.exercises.find(e => e.id === answer.exerciseId);
      if (!exercise) continue;

      let points = 0;
      let isCorrect = null;

      // Auto-grade based on exercise type
      switch (exercise.type) {
        case "MULTIPLE_CHOICE":
          isCorrect = answer.answer === exercise.data.correctAnswer;
          points = isCorrect ? exercise.points : 0;
          totalAutoGraded += points;
          break;

        case "TRUE_FALSE":
          isCorrect = answer.answer === exercise.data.correctAnswer;
          points = isCorrect ? exercise.points : 0;
          totalAutoGraded += points;
          break;

        case "SHORT_ANSWER":
          // Simple exact match (case-insensitive)
          if (exercise.data.correctAnswer) {
            isCorrect = answer.answer?.toLowerCase().trim() === 
                       exercise.data.correctAnswer.toLowerCase().trim();
            points = isCorrect ? exercise.points : 0;
            totalAutoGraded += points;
          }
          break;
      }

      // Update answer with auto-grading results
      if (isCorrect !== null) {
        const updated = await prisma.submissionAnswer.update({
          where: { id: answer.id },
          data: {
            points,
            isCorrect,
          },
        });
        updatedAnswers.push(updated);
      }
    }

    // Check if all questions are auto-gradable
    const allAutoGradable = assignment.exercises.every(
      ex => ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(ex.type)
    );

    if (allAutoGradable) {
      // Calculate final score
      const totalPoints = assignment.exercises.reduce((sum, ex) => sum + ex.points, 0);
      const score = Math.round((totalAutoGraded / totalPoints) * 100);

      // Update submission as graded
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          graded: true,
          gradedAt: new Date(),
          score,
        },
      });
    }

    return NextResponse.json({
      submission: {
        id: submission.id,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}