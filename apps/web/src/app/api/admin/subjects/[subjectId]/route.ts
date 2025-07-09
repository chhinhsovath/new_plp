import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Check if subject exists and has no lessons
    const subject = await prisma.subject.findUnique({
      where: { id: params.subjectId },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    if (subject._count.lessons > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject with existing lessons" },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id: params.subjectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, nameKh, description, gradeLevel, imageUrl } = body;

    const subject = await prisma.subject.update({
      where: { id: params.subjectId },
      data: {
        ...(name && { name }),
        ...(nameKh && { nameKh }),
        ...(description !== undefined && { description }),
        ...(gradeLevel && { gradeLevel }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      nameKh: subject.nameKh,
      description: subject.description,
      gradeLevel: subject.gradeLevel,
      imageUrl: subject.imageUrl,
      updatedAt: subject.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}