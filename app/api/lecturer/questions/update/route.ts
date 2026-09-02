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

    const { questionId, text, options } = await request.json();

    if (!questionId || !text || !options) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            module: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (
      !question ||
      question.quiz.module.course.lecturerId !== lecturer.id
    ) {
      return NextResponse.json(
        { error: "Question not found or access denied" },
        { status: 403 }
      );
    }

    // Update question text
    await prisma.question.update({
      where: { id: questionId },
      data: { text },
    });

    // Update options
    for (const opt of options) {
      if (opt.id) {
        await prisma.option.update({
          where: { id: opt.id },
          data: {
            text: opt.text,
            isCorrect: opt.isCorrect,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update question error:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}