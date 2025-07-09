import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function GET() {
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

    // Get teacher statistics
    const [
      classes,
      students,
      assignments,
      pendingGrading,
      upcomingClasses,
      recentSubmissions,
      forumPosts,
    ] = await Promise.all([
      // Total classes
      prisma.class.count({
        where: { teacherId: user.id },
      }),
      
      // Total students across all classes
      prisma.classEnrollment.count({
        where: {
          class: { teacherId: user.id },
          status: "ACTIVE",
        },
      }),
      
      // Active assignments
      prisma.assignment.count({
        where: {
          class: { teacherId: user.id },
          dueDate: { gte: new Date() },
        },
      }),
      
      // Pending grading
      prisma.submission.count({
        where: {
          assignment: {
            class: { teacherId: user.id },
          },
          graded: false,
        },
      }),
      
      // Today's classes
      prisma.classSchedule.count({
        where: {
          class: { teacherId: user.id },
          dayOfWeek: new Date().getDay(),
        },
      }),
      
      // Recent submissions (last 24 hours)
      prisma.submission.count({
        where: {
          assignment: {
            class: { teacherId: user.id },
          },
          submittedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Forum activity (questions from students in teacher's classes)
      prisma.forumPost.count({
        where: {
          author: {
            enrollments: {
              some: {
                class: { teacherId: user.id },
              },
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate average class progress
    const classProgress = await prisma.class.findMany({
      where: { teacherId: user.id },
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                submissions: {
                  where: {
                    assignment: {
                      classId: { in: [] }, // Will be filled dynamically
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    let totalProgress = 0;
    let classCount = 0;

    for (const cls of classProgress) {
      if (cls._count.assignments > 0) {
        const totalSubmissions = cls.enrollments.reduce(
          (sum, enrollment) => sum + enrollment.student.submissions.length,
          0
        );
        const expectedSubmissions = cls.enrollments.length * cls._count.assignments;
        if (expectedSubmissions > 0) {
          totalProgress += (totalSubmissions / expectedSubmissions) * 100;
          classCount++;
        }
      }
    }

    const averageClassProgress = classCount > 0 
      ? Math.round(totalProgress / classCount)
      : 0;

    return NextResponse.json({
      totalClasses: classes,
      totalStudents: students,
      activeAssignments: assignments,
      pendingGrading,
      upcomingClasses,
      averageClassProgress,
      recentSubmissions,
      forumActivity: forumPosts,
    });
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}