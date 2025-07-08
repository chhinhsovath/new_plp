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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";

    // Build query conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (role !== "all") {
      where.role = role;
    }
    
    if (status === "active") {
      where.active = true;
    } else if (status === "inactive") {
      where.active = false;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              userProgress: {
                where: { completed: true },
              },
            },
          },
          subscription: {
            select: {
              status: true,
              endDate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      parentId: user.parentId,
      active: user.active,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      lessonsCompleted: user._count.userProgress,
      subscriptionStatus: user.subscription?.status,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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

    const body = await request.json();
    const { email, firstName, lastName, role } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user in database (Clerk integration would be needed here)
    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role,
        clerkId: `manual_${Date.now()}`, // Temporary ID
        active: true,
      },
    });

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}