import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 }
      );
    }

    // Check if already completed
    const existing = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: student.id,
          lessonId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already completed" });
    }

    await prisma.lessonProgress.create({
      data: {
        studentId: student.id,
        lessonId,
        completed: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Complete lesson error:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as completed" },
      { status: 500 }
    );
  }
}