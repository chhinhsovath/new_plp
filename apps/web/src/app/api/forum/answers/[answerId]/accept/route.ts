import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { prisma } from "@plp/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { answerId: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    // Get answer with post details
    const answer = await prisma.forumAnswer.findUnique({
      where: { id: params.answerId },
      include: {
        post: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "Answer not found" },
        { status: 404 }
      );
    }

    // Check if user is the post author
    if (answer.post.authorId !== user.id) {
      return NextResponse.json(
        { error: "Only the post author can accept answers" },
        { status: 403 }
      );
    }

    // Check if answer is already accepted
    if (answer.accepted) {
      // Unaccept the answer
      await prisma.forumAnswer.update({
        where: { id: params.answerId },
        data: { accepted: false },
      });

      return NextResponse.json({ success: true, accepted: false });
    } else {
      // First, unaccept any other accepted answer for this post
      await prisma.forumAnswer.updateMany({
        where: {
          postId: answer.postId,
          accepted: true,
        },
        data: { accepted: false },
      });

      // Then accept this answer
      await prisma.forumAnswer.update({
        where: { id: params.answerId },
        data: { accepted: true },
      });

      return NextResponse.json({ success: true, accepted: true });
    }
  } catch (error) {
    console.error("Error accepting answer:", error);
    return NextResponse.json(
      { error: "Failed to accept answer" },
      { status: 500 }
    );
  }
}