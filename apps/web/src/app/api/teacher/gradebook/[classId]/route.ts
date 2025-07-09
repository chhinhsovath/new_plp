import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
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

    // Check if class belongs to teacher
    const classData = await prisma.class.findFirst({
      where: {
        id: params.classId,
        teacherId: user.id,
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Get all students enrolled in the class
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        classId: params.classId,
        status: "ACTIVE",
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
      },
      orderBy: [
        {
          student: {
            lastName: "asc",
          },
        },
        {
          student: {
            firstName: "asc",
          },
        },
      ],
    });

    const students = enrollments.map(e => e.student);

    // Get all assignments for the class
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: params.classId,
      },
      select: {
        id: true,
        title: true,
        totalPoints: true,
        dueDate: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Get all submissions and grades for this class
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: {
          in: assignments.map(a => a.id),
        },
        studentId: {
          in: students.map(s => s.id),
        },
      },
      select: {
        id: true,
        studentId: true,
        assignmentId: true,
        score: true,
        graded: true,
        submittedAt: true,
        gradedAt: true,
      },
    });

    // Get grades from the Grade table
    const grades = await prisma.grade.findMany({
      where: {
        assignmentId: {
          in: assignments.map(a => a.id),
        },
        studentId: {
          in: students.map(s => s.id),
        },
      },
      select: {
        studentId: true,
        assignmentId: true,
        score: true,
        createdAt: true,
      },
    });

    // Build grades object with student-assignment as key
    const gradesMap: { [key: string]: any } = {};

    // First, add submission data
    submissions.forEach(submission => {
      const key = `${submission.studentId}-${submission.assignmentId}`;
      const assignment = assignments.find(a => a.id === submission.assignmentId);
      const percentage = submission.score !== null && assignment
        ? Math.round((submission.score / 100) * 100) // score is already a percentage
        : null;

      gradesMap[key] = {
        studentId: submission.studentId,
        assignmentId: submission.assignmentId,
        score: submission.score,
        percentage,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      };
    });

    // Then, override with grade data if exists
    grades.forEach(grade => {
      const key = `${grade.studentId}-${grade.assignmentId}`;
      const assignment = assignments.find(a => a.id === grade.assignmentId);
      const percentage = grade.score !== null
        ? Math.round(grade.score) // grade.score is already a percentage
        : null;

      gradesMap[key] = {
        ...gradesMap[key],
        score: grade.score,
        percentage,
        gradedAt: grade.createdAt,
      };
    });

    return NextResponse.json({
      class: classData,
      students,
      assignments,
      grades: gradesMap,
    });
  } catch (error) {
    console.error("Error fetching gradebook data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gradebook data" },
      { status: 500 }
    );
  }
}