import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { exerciseId, lessonId, subjectId, answer, timeSpent } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { studentProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      // For demo, create a mock exercise
      // In production, exercises should already exist in DB
      return NextResponse.json({
        success: true,
        message: "Exercise submission recorded (demo mode)",
      });
    }

    // Check if attempt already exists
    const existingAttempt = await prisma.exerciseAttempt.findFirst({
      where: {
        userId: user.id,
        exerciseId,
      },
      orderBy: { completedAt: "desc" },
    });

    // Create new attempt
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        userId: user.id,
        exerciseId,
        answer: answer,
        isCorrect: answer.correct || false,
        score: answer.score || 0,
        timeSpent: timeSpent || 0,
        attempts: (existingAttempt?.attempts || 0) + 1,
      },
    });

    // Update student profile if correct
    if (answer.correct && user.studentProfile) {
      const pointsToAdd = answer.score || exercise.points;
      
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: {
          points: { increment: pointsToAdd },
          lastActive: new Date(),
        },
      });

      // Update lesson progress
      const progress = await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId,
          },
        },
        update: {
          score: { increment: pointsToAdd },
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          lessonId,
          score: pointsToAdd,
          completed: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error("Error submitting exercise:", error);
    return NextResponse.json(
      { error: "Failed to submit exercise" },
      { status: 500 }
    );
  }
}