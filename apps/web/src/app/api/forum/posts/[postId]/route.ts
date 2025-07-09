import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@plp/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: params.postId },
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id: params.postId },
      data: { views: { increment: 1 } },
    });

    const formattedPost = {
      id: post.id,
      title: post.title,
      content: post.content,
      subject: post.subject,
      authorId: post.authorId,
      authorName: `${post.author.firstName} ${post.author.lastName}`,
      createdAt: post.createdAt.toISOString(),
      views: post.views + 1, // Return incremented view count
      upvotes: post.upvotes,
      tags: post.tags,
    };

    return NextResponse.json({ post: formattedPost });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}