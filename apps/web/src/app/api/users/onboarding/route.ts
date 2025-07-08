import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@plp/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName, role, grade } = body;

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        role,
        studentProfile: role === "STUDENT" ? {
          create: {
            grade: grade || "1",
            points: 0,
            level: 1,
            streak: 0,
          }
        } : undefined,
      },
      include: {
        studentProfile: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}