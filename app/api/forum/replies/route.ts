import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { postId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    const reply = await prisma.forumReply.create({
      data: {
        content,
        postId,
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Create forum reply error:", error);
    return NextResponse.json(
      { error: "Failed to post reply" },
      { status: 500 }
    );
  }
}