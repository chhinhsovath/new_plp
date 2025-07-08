import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
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
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if subscription is still active
    if (user.subscription) {
      const now = new Date();
      const isActive = user.subscription.status === "ACTIVE" && 
                      user.subscription.endDate > now;

      // Update status if expired
      if (!isActive && user.subscription.status === "ACTIVE") {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { status: "EXPIRED" },
        });
      }

      return NextResponse.json({
        subscription: {
          id: user.subscription.id,
          plan: user.subscription.plan,
          status: isActive ? "ACTIVE" : user.subscription.status,
          startDate: user.subscription.startDate.toISOString(),
          endDate: user.subscription.endDate.toISOString(),
          isActive,
        },
      });
    }

    return NextResponse.json({ subscription: null });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}