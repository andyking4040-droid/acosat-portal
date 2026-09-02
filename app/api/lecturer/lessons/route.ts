import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lecturer = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    const { moduleId, title, content, videoUrl } = await request.json();

    if (!moduleId || !title) {
      return NextResponse.json(
        { error: "Module ID and title are required" },
        { status: 400 }
      );
    }

    // Verify the module belongs to a course owned by this lecturer
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module || module.course.lecturerId !== lecturer.id) {
      return NextResponse.json(
        { error: "Module not found or access denied" },
        { status: 403 }
      );
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content: content || null,
        videoUrl: videoUrl || null,
        order: lastLesson ? lastLesson.order + 1 : 1,
        moduleId,
      },
    });

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}