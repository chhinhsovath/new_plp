import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string; enrollmentId: string } }
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

    // Check if enrollment exists and belongs to teacher's class
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        id: params.enrollmentId,
        classId: params.classId,
        class: {
          teacherId: user.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Soft delete - update status to DROPPED
    await prisma.classEnrollment.update({
      where: { id: params.enrollmentId },
      data: { status: "DROPPED" },
    });

    return NextResponse.json({
      message: "Student removed from class successfully",
    });
  } catch (error) {
    console.error("Error removing student:", error);
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    );
  }
}