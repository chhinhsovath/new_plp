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

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      phoneNumber: user.phoneNumber,
      address: user.address,
      school: user.school,
      grade: user.grade,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      bio,
      phoneNumber,
      address,
      school,
      grade,
      avatarUrl,
    } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(school !== undefined && { school }),
        ...(grade !== undefined && { grade }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    // Also update Clerk user if name changed
    if (firstName !== undefined || lastName !== undefined) {
      try {
        await clerkUser.update({
          firstName: firstName || clerkUser.firstName,
          lastName: lastName || clerkUser.lastName,
        });
      } catch (error) {
        console.error("Error updating Clerk user:", error);
      }
    }

    return NextResponse.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      bio: updatedUser.bio,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      school: updatedUser.school,
      grade: updatedUser.grade,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}