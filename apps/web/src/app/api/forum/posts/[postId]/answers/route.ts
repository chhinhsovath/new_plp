import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const answers = await prisma.forumAnswer.findMany({
      where: { postId: params.postId },
      orderBy: [
        { accepted: "desc" },
        { upvotes: "desc" },
        { createdAt: "asc" },
      ],
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    const formattedAnswers = answers.map(answer => ({
      id: answer.id,
      content: answer.content,
      authorId: answer.authorId,
      authorName: `${answer.author.firstName} ${answer.author.lastName}`,
      authorRole: answer.author.role,
      createdAt: answer.createdAt.toISOString(),
      upvotes: answer.upvotes,
      isAccepted: answer.accepted,
    }));

    return NextResponse.json({ answers: formattedAnswers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
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

    // Check if post exists
    const post = await prisma.forumPost.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Create answer
    const answer = await prisma.forumAnswer.create({
      data: {
        content: content.trim(),
        postId: params.postId,
        authorId: user.id,
        upvotes: 0,
        accepted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: answer.id,
      content: answer.content,
      authorId: answer.authorId,
      authorName: `${answer.author.firstName} ${answer.author.lastName}`,
      authorRole: answer.author.role,
      createdAt: answer.createdAt.toISOString(),
      upvotes: answer.upvotes,
      isAccepted: answer.accepted,
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "Failed to create answer" },
      { status: 500 }
    );
  }
}