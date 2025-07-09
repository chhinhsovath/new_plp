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

    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedSubjects = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      nameKh: subject.nameKh,
      description: subject.description,
      gradeLevel: subject.gradeLevel,
      imageUrl: subject.imageUrl,
      lessonsCount: subject._count.lessons,
      createdAt: subject.createdAt.toISOString(),
    }));

    return NextResponse.json({ subjects: formattedSubjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
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
    const { name, nameKh, description, gradeLevel, imageUrl } = body;

    // Validate required fields
    if (!name || !nameKh || !gradeLevel) {
      return NextResponse.json(
        { error: "Name, Khmer name, and grade level are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        nameKh,
        description: description || "",
        gradeLevel,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ 
      id: subject.id,
      name: subject.name,
      nameKh: subject.nameKh,
      description: subject.description,
      gradeLevel: subject.gradeLevel,
      imageUrl: subject.imageUrl,
      createdAt: subject.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}