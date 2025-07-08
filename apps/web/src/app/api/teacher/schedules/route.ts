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

    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get all schedules for teacher's classes
    const schedules = await prisma.classSchedule.findMany({
      where: {
        class: {
          teacherId: user.id,
          status: "ACTIVE",
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                enrollments: {
                  where: {
                    status: "ACTIVE",
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json({
      schedules,
    });
  } catch (error) {
    console.error("Error fetching teacher schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}