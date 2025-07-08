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

    // Get all classes the student is enrolled in
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        studentId: user.id,
        status: "ACTIVE",
      },
      include: {
        class: {
          include: {
            subject: {
              select: {
                name: true,
              },
            },
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            assignments: {
              include: {
                submissions: {
                  where: {
                    studentId: user.id,
                  },
                  select: {
                    id: true,
                    submittedAt: true,
                    score: true,
                    graded: true,
                    feedback: true,
                  },
                },
              },
              orderBy: {
                dueDate: "desc",
              },
            },
          },
        },
      },
    });

    // Calculate grades for each class
    const grades = enrollments.map((enrollment) => {
      const classData = enrollment.class;
      const assignments = classData.assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        type: assignment.type,
        totalPoints: assignment.totalPoints,
        dueDate: assignment.dueDate,
        submission: assignment.submissions[0] || null,
      }));

      // Calculate average for the class
      const gradedAssignments = assignments.filter(
        (a) => a.submission?.graded && a.submission.score !== null
      );

      let average = 0;
      if (gradedAssignments.length > 0) {
        const totalScore = gradedAssignments.reduce(
          (sum, a) => sum + (a.submission?.score || 0),
          0
        );
        average = Math.round(totalScore / gradedAssignments.length);
      }

      // Determine letter grade
      let grade = "N/A";
      if (gradedAssignments.length > 0) {
        if (average >= 90) grade = "A";
        else if (average >= 80) grade = "B";
        else if (average >= 70) grade = "C";
        else if (average >= 60) grade = "D";
        else grade = "F";
      }

      return {
        class: {
          id: classData.id,
          name: classData.name,
          subject: classData.subject,
          teacher: classData.teacher,
        },
        assignments,
        average,
        grade,
      };
    });

    return NextResponse.json({
      grades,
    });
  } catch (error) {
    console.error("Error fetching student grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}