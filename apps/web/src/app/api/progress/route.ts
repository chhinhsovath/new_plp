import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { 
        studentProfile: true,
        progress: {
          include: {
            lesson: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get recent exercise attempts
    const recentAttempts = await prisma.exerciseAttempt.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: {
        exercise: {
          include: {
            subject: true,
            lesson: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalPoints: user.studentProfile?.points || 0,
      level: user.studentProfile?.level || 1,
      streak: user.studentProfile?.streak || 0,
      completedLessons: user.progress.filter(p => p.completed).length,
      totalExercises: recentAttempts.length,
      correctAnswers: recentAttempts.filter(a => a.isCorrect).length,
      accuracy: recentAttempts.length > 0 
        ? Math.round((recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length) * 100)
        : 0,
    };

    // Group progress by subject
    const subjectProgress = user.progress.reduce((acc: any, progress) => {
      const subjectId = progress.lesson.subject.id;
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: progress.lesson.subject,
          lessons: [],
          totalScore: 0,
          completedLessons: 0,
        };
      }
      
      acc[subjectId].lessons.push({
        lesson: progress.lesson,
        completed: progress.completed,
        score: progress.score,
      });
      
      acc[subjectId].totalScore += progress.score;
      if (progress.completed) {
        acc[subjectId].completedLessons += 1;
      }
      
      return acc;
    }, {});

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentProfile: user.studentProfile,
      },
      stats,
      subjectProgress: Object.values(subjectProgress),
      recentActivity: recentAttempts,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}