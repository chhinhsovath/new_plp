import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
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

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get all classes for the teacher
    const classes = await prisma.class.findMany({
      where: { teacherId: user.id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            schedules: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Active first, then upcoming, then archived
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      classes,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
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

    const body = await request.json();
    const {
      name,
      description,
      subjectId,
      grade,
      startDate,
      endDate,
      maxStudents,
      schedules,
    } = body;

    // Validate required fields
    if (!name || !subjectId || !grade || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        subjectId,
        teacherId: user.id,
        grade,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxStudents: maxStudents || 30,
        status: new Date(startDate) > new Date() ? "UPCOMING" : "ACTIVE",
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

    // Create schedules if provided
    if (schedules && schedules.length > 0) {
      await prisma.classSchedule.createMany({
        data: schedules.map((schedule: any) => ({
          classId: newClass.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
        })),
      });
    }

    return NextResponse.json({
      class: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}