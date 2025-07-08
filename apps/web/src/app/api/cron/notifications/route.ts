import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@plp/database";
import { NotificationTriggers } from "@/lib/notifications";
import { addHours, isWithinInterval } from "date-fns";

// This endpoint should be called periodically (e.g., every hour) by a cron job
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source (e.g., cron service)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const in24Hours = addHours(now, 24);

    // Find assignments due within the next 24 hours
    const assignmentsDueSoon = await prisma.assignment.findMany({
      where: {
        status: "PUBLISHED",
        dueDate: {
          gte: now,
          lte: in24Hours,
        },
      },
      select: {
        id: true,
        title: true,
        classId: true,
      },
    });

    // Send notifications for each assignment
    for (const assignment of assignmentsDueSoon) {
      await NotificationTriggers.assignmentDueSoon(assignment.id);
    }

    // Find live classes starting in the next 5 minutes
    const in5Minutes = addHours(now, 5 / 60);
    
    const liveClassesStartingSoon = await prisma.liveClass.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          gte: now,
          lte: in5Minutes,
        },
      },
      select: {
        id: true,
        title: true,
        classId: true,
      },
    });

    // Send notifications for live classes
    for (const liveClass of liveClassesStartingSoon) {
      await NotificationTriggers.liveClassStarting(
        liveClass.classId,
        liveClass.id,
        liveClass.title
      );
    }

    return NextResponse.json({
      success: true,
      notifications: {
        assignmentsDueSoon: assignmentsDueSoon.length,
        liveClassesStarting: liveClassesStartingSoon.length,
      },
    });
  } catch (error) {
    console.error("Error in notification cron:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }
}