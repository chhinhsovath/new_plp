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

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get various payment statistics
    const [
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      totalPayments,
      successfulPayments,
      paywayPayments,
      wingPayments,
    ] = await Promise.all([
      // Total revenue (all time)
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      
      // Current month revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: thisMonth },
        },
        _sum: { amount: true },
      }),
      
      // Last month revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
        _sum: { amount: true },
      }),
      
      // Total payments count
      prisma.payment.count(),
      
      // Successful payments count
      prisma.payment.count({
        where: { status: "COMPLETED" },
      }),
      
      // PayWay payments count
      prisma.payment.count({
        where: {
          method: "PAYWAY",
          status: "COMPLETED",
        },
      }),
      
      // Wing payments count
      prisma.payment.count({
        where: {
          method: "WING",
          status: "COMPLETED",
        },
      }),
    ]);

    // Calculate statistics
    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const monthlyRevenueAmount = monthlyRevenue._sum.amount || 0;
    const lastMonthRevenueAmount = lastMonthRevenue._sum.amount || 0;
    
    const revenueGrowth = lastMonthRevenueAmount > 0
      ? Math.round(((monthlyRevenueAmount - lastMonthRevenueAmount) / lastMonthRevenueAmount) * 100)
      : 0;
      
    const successRate = totalPayments > 0
      ? Math.round((successfulPayments / totalPayments) * 100)
      : 0;
      
    const averageTransaction = successfulPayments > 0
      ? totalRevenueAmount / successfulPayments
      : 0;
      
    const totalMethodPayments = paywayPayments + wingPayments;
    const paymentMethodBreakdown = {
      payway: totalMethodPayments > 0 ? Math.round((paywayPayments / totalMethodPayments) * 100) : 0,
      wing: totalMethodPayments > 0 ? Math.round((wingPayments / totalMethodPayments) * 100) : 0,
    };

    return NextResponse.json({
      totalRevenue: totalRevenueAmount,
      monthlyRevenue: monthlyRevenueAmount,
      successRate,
      averageTransaction,
      revenueGrowth,
      paymentMethodBreakdown,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    );
  }
}