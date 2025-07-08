import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get parent user
    const parent = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!parent || parent.role !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all children
    const children = await prisma.user.findMany({
      where: { parentId: parent.id },
      include: {
        studentProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Failed to fetch children" },
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

    const body = await request.json();
    const { firstName, lastName, username, password, grade } = body;

    // Get parent user
    const parent = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!parent || parent.role !== "PARENT") {
      return NextResponse.json(
        { error: "Only parents can create child accounts" },
        { status: 403 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: `${username}@plp-child.local` // We use a special domain for child accounts
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create child account
    // Note: In a real app, you'd create a Clerk user here too
    // For now, we'll just store in our database
    const child = await prisma.user.create({
      data: {
        clerkId: `child_${username}_${Date.now()}`, // Temporary ID
        email: `${username}@plp-child.local`,
        firstName,
        lastName,
        role: "STUDENT",
        parentId: parent.id,
        studentProfile: {
          create: {
            grade,
            points: 0,
            level: 1,
            streak: 0,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    // Store password hash separately (you might want a separate table for this)
    // For now, we'll return success

    return NextResponse.json({
      ...child,
      username, // Return username for parent to save
    });
  } catch (error) {
    console.error("Error creating child account:", error);
    return NextResponse.json(
      { error: "Failed to create child account" },
      { status: 500 }
    );
  }
}