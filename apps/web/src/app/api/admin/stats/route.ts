import { NextResponse } from "next/server";
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

    // Get current date and last month date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all stats in parallel
    const [
      totalUsers,
      lastMonthUsers,
      activeStudents,
      totalSubjects,
      totalLessons,
      totalExercises,
      forumPosts,
      monthlyPayments,
      lastMonthPayments,
      dailyActiveUsers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Users last month
      prisma.user.count({
        where: {
          createdAt: {
            lt: thisMonth,
          },
        },
      }),
      
      // Active students (logged in within last 30 days)
      prisma.user.count({
        where: {
          role: "STUDENT",
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Total subjects
      prisma.subject.count(),
      
      // Total lessons
      prisma.lesson.count(),
      
      // Total exercises
      prisma.exercise.count(),
      
      // Forum posts
      prisma.forumPost.count(),
      
      // Monthly payments (current month)
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: thisMonth,
          },
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Last month payments
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
      
      // Daily active users
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate growth percentages
    const userGrowth = lastMonthUsers > 0 
      ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
      : 100;

    const monthlyRevenue = monthlyPayments._sum.amount || 0;
    const lastMonthRevenue = lastMonthPayments._sum.amount || 0;
    const revenueChange = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    const engagementRate = totalUsers > 0
      ? Math.round((dailyActiveUsers / totalUsers) * 100)
      : 0;

    return NextResponse.json({
      totalUsers,
      activeStudents,
      totalSubjects,
      totalLessons,
      totalExercises,
      forumPosts,
      monthlyRevenue,
      revenueChange,
      userGrowth,
      engagementRate,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}