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

    const { courseId, title, content } = await request.json();

    if (!courseId || !title || !content) {
      return NextResponse.json(
        { error: "Course, title and content are required" },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        courseId,
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Create forum post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}