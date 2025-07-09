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
          include: {
            submissions: {
              where: {
                assignment: {
                  classId: params.classId,
                },
              },
              select: {
                id: true,
                assignmentId: true,
                score: true,
                graded: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    const students = enrollments.map((enrollment) => ({
      ...enrollment.student,
      enrollment: {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
      },
    }));

    return NextResponse.json({
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(
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
        _count: {
          select: {
            enrollments: true,
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

    // Check if class is full
    if (classData._count.enrollments >= classData.maxStudents) {
      return NextResponse.json(
        { error: "Class is full" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find student by email
    const student = await prisma.user.findUnique({
      where: { email },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "User is not a student" },
        { status: 400 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.classEnrollment.findFirst({
      where: {
        classId: params.classId,
        studentId: student.id,
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === "ACTIVE") {
        return NextResponse.json(
          { error: "Student is already enrolled in this class" },
          { status: 400 }
        );
      } else {
        // Reactivate enrollment
        const enrollment = await prisma.classEnrollment.update({
          where: { id: existingEnrollment.id },
          data: { status: "ACTIVE" },
          include: {
            student: true,
          },
        });
        
        return NextResponse.json({
          enrollment,
        });
      }
    }

    // Create new enrollment
    const enrollment = await prisma.classEnrollment.create({
      data: {
        classId: params.classId,
        studentId: student.id,
        status: "ACTIVE",
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json({
      enrollment,
    });
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json(
      { error: "Failed to add student" },
      { status: 500 }
    );
  }
}