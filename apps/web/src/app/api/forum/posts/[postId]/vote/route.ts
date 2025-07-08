import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

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
    const { action } = body; // 'upvote' or 'remove'

    if (!action || !['upvote', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
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

    // Check if user has already voted
    const existingVote = await prisma.forumVote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: params.postId,
        },
      },
    });

    if (action === 'upvote') {
      if (existingVote) {
        return NextResponse.json(
          { error: "Already voted" },
          { status: 400 }
        );
      }

      // Create vote and increment count in transaction
      await prisma.$transaction([
        prisma.forumVote.create({
          data: {
            userId: user.id,
            postId: params.postId,
          },
        }),
        prisma.forumPost.update({
          where: { id: params.postId },
          data: { upvotes: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ success: true, voted: true });
    } else {
      if (!existingVote) {
        return NextResponse.json(
          { error: "Not voted yet" },
          { status: 400 }
        );
      }

      // Remove vote and decrement count in transaction
      await prisma.$transaction([
        prisma.forumVote.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId: params.postId,
            },
          },
        }),
        prisma.forumPost.update({
          where: { id: params.postId },
          data: { upvotes: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ success: true, voted: false });
    }
  } catch (error) {
    console.error("Error handling vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}