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

    // Get recent activities
    const recentActivities = [];

    // Get recent submissions
    const submissions = await prisma.submission.findMany({
      where: {
        assignment: {
          class: { teacherId: user.id },
        },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignment: {
          select: {
            title: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });

    submissions.forEach(submission => {
      recentActivities.push({
        id: `submission-${submission.id}`,
        type: "submission",
        title: `Assignment submitted: ${submission.assignment.title}`,
        studentName: `${submission.student.firstName} ${submission.student.lastName}`,
        className: submission.assignment.class.name,
        timestamp: submission.submittedAt.toISOString(),
      });
    });

    // Get recent forum questions from students
    const forumPosts = await prisma.forumPost.findMany({
      where: {
        author: {
          enrollments: {
            some: {
              class: { teacherId: user.id },
            },
          },
        },
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    forumPosts.forEach(post => {
      recentActivities.push({
        id: `question-${post.id}`,
        type: "question",
        title: `New question: ${post.title}`,
        studentName: `${post.author.firstName} ${post.author.lastName}`,
        className: post.subject,
        timestamp: post.createdAt.toISOString(),
      });
    });

    // Get recent grades given
    const grades = await prisma.grade.findMany({
      where: {
        assignment: {
          class: { teacherId: user.id },
        },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignment: {
          select: {
            title: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    grades.forEach(grade => {
      recentActivities.push({
        id: `grade-${grade.id}`,
        type: "grade",
        title: `Grade posted: ${grade.assignment.title}`,
        studentName: `${grade.student.firstName} ${grade.student.lastName}`,
        className: grade.assignment.class.name,
        timestamp: grade.createdAt.toISOString(),
      });
    });

    // Sort all activities by timestamp
    recentActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: recentActivities.slice(0, 10), // Return top 10 most recent
    });
  } catch (error) {
    console.error("Error fetching teacher activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}