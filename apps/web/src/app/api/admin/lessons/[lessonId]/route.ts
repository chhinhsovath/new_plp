import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
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

    // Check if lesson exists and has no exercises
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    if (lesson._count.exercises > 0) {
      return NextResponse.json(
        { error: "Cannot delete lesson with existing exercises" },
        { status: 400 }
      );
    }

    await prisma.lesson.delete({
      where: { id: params.lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
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
    const { title, titleKh, content, contentKh, orderIndex } = body;

    const lesson = await prisma.lesson.update({
      where: { id: params.lessonId },
      data: {
        ...(title && { title }),
        ...(titleKh && { titleKh }),
        ...(content !== undefined && { content }),
        ...(contentKh !== undefined && { contentKh }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      titleKh: lesson.titleKh,
      orderIndex: lesson.orderIndex,
      updatedAt: lesson.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}