import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ votes: {} });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ votes: {} });
    }

    // Get all votes for this post and its answers
    const votes = await prisma.forumVote.findMany({
      where: {
        userId: user.id,
        OR: [
          { postId: params.postId },
          { answer: { postId: params.postId } },
        ],
      },
      include: {
        answer: {
          select: { id: true },
        },
      },
    });

    // Format votes into a map
    const voteMap: Record<string, boolean> = {};
    votes.forEach(vote => {
      if (vote.postId) {
        voteMap[`post-${vote.postId}`] = true;
      }
      if (vote.answerId && vote.answer) {
        voteMap[`answer-${vote.answerId}`] = true;
      }
    });

    return NextResponse.json({ votes: voteMap });
  } catch (error) {
    console.error("Error fetching user votes:", error);
    return NextResponse.json({ votes: {} });
  }
}