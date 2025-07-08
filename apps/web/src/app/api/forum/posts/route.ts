import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query conditions
    const where: any = {};
    if (subject && subject !== "all") {
      where.subject = subject;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    // Build sort options
    let orderBy: any = {};
    switch (sort) {
      case "popular":
        orderBy = { views: "desc" };
        break;
      case "votes":
        orderBy = { upvotes: "desc" };
        break;
      case "unanswered":
        where.answers = { none: {} };
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get posts with answer count
    const posts = await prisma.forumPost.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { answers: true },
        },
        answers: {
          where: { accepted: true },
          select: { id: true },
        },
      },
    });

    // Get total count for pagination
    const total = await prisma.forumPost.count({ where });

    // Format response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      subject: post.subject,
      authorId: post.authorId,
      authorName: `${post.author.firstName} ${post.author.lastName}`,
      createdAt: post.createdAt.toISOString(),
      views: post.views,
      upvotes: post.upvotes,
      answers: post._count.answers,
      hasAcceptedAnswer: post.answers.length > 0,
      tags: post.tags,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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
    const { title, content, subject, tags } = body;

    // Validate input
    if (!title || !content || !subject) {
      return NextResponse.json(
        { error: "Title, content, and subject are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        subject,
        authorId: user.id,
        tags: tags || [],
        views: 0,
        upvotes: 0,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      subject: post.subject,
      authorId: post.authorId,
      authorName: `${post.author.firstName} ${post.author.lastName}`,
      createdAt: post.createdAt.toISOString(),
      views: post.views,
      upvotes: post.upvotes,
      tags: post.tags,
    });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}