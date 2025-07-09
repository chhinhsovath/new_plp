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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || "all";
    const method = searchParams.get("method") || "all";
    const range = searchParams.get("range") || "30days";

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    switch (range) {
      case "7days":
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "30days":
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        };
        break;
      case "90days":
        dateFilter = {
          createdAt: {
            gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          },
        };
        break;
    }

    // Build query conditions
    const where: any = {
      ...dateFilter,
    };
    
    if (status !== "all") {
      where.status = status;
    }
    
    if (method !== "all") {
      where.method = method;
    }

    // Get payments with user info
    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 payments
    });

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      userId: payment.userId,
      userName: `${payment.user.firstName} ${payment.user.lastName}`,
      userEmail: payment.user.email,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      description: payment.description,
      createdAt: payment.createdAt.toISOString(),
      completedAt: payment.completedAt?.toISOString(),
    }));

    return NextResponse.json({ payments: formattedPayments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}