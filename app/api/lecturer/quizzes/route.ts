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

    const { moduleId, title, description, timeLimit } = await request.json();

    if (!moduleId || !title) {
      return NextResponse.json(
        { error: "Module ID and title are required" },
        { status: 400 }
      );
    }

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

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        timeLimit: timeLimit || null,
        moduleId,
      },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}