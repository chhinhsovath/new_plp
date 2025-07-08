import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Active status must be a boolean" },
        { status: 400 }
      );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { active },
      select: {
        id: true,
        active: true,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      active: updatedUser.active,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}