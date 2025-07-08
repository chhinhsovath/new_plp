import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
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

    // Get class details
    const classData = await prisma.class.findFirst({
      where: {
        id: params.classId,
        teacherId: user.id,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        schedules: true,
        _count: {
          select: {
            enrollments: true,
            assignments: true,
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

    return NextResponse.json({
      class: classData,
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "Failed to fetch class details" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.classId,
        teacherId: user.id,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      subjectId,
      grade,
      startDate,
      endDate,
      maxStudents,
      status,
    } = body;

    // Update class
    const updatedClass = await prisma.class.update({
      where: { id: params.classId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(subjectId && { subjectId }),
        ...(grade && { grade }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(maxStudents && { maxStudents }),
        ...(status && { status }),
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      class: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const existingClass = await prisma.class.findFirst({
      where: {
        id: params.classId,
        teacherId: user.id,
      },
    });

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      );
    }

    // Archive the class instead of deleting
    await prisma.class.update({
      where: { id: params.classId },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({
      message: "Class archived successfully",
    });
  } catch (error) {
    console.error("Error archiving class:", error);
    return NextResponse.json(
      { error: "Failed to archive class" },
      { status: 500 }
    );
  }
}