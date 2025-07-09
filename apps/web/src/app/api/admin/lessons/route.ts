import { NextRequest, NextResponse } from "next/server";
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

    const lessons = await prisma.lesson.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { exercises: true },
        },
      },
      orderBy: [
        { subjectId: "asc" },
        { orderIndex: "asc" },
      ],
    });

    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      titleKh: lesson.titleKh,
      subjectId: lesson.subjectId,
      subjectName: lesson.subject.name,
      orderIndex: lesson.orderIndex,
      exercisesCount: lesson._count.exercises,
      createdAt: lesson.createdAt.toISOString(),
    }));

    return NextResponse.json({ lessons: formattedLessons });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { title, titleKh, content, contentKh, subjectId, orderIndex } = body;

    // Validate required fields
    if (!title || !titleKh || !subjectId) {
      return NextResponse.json(
        { error: "Title, Khmer title, and subject are required" },
        { status: 400 }
      );
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        titleKh,
        content: content || "",
        contentKh: contentKh || "",
        subjectId,
        orderIndex: orderIndex || 1,
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      id: lesson.id,
      title: lesson.title,
      titleKh: lesson.titleKh,
      subjectId: lesson.subjectId,
      subjectName: lesson.subject.name,
      orderIndex: lesson.orderIndex,
      createdAt: lesson.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}