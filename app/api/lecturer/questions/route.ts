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

    const { quizId, text, type, options } = await request.json();

    if (!quizId || !text) {
      return NextResponse.json(
        { error: "Quiz ID and question text are required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        module: {
          include: { course: true },
        },
      },
    });

    if (!quiz || quiz.module.course.lecturerId !== lecturer.id) {
      return NextResponse.json(
        { error: "Quiz not found or access denied" },
        { status: 403 }
      );
    }

    const lastQuestion = await prisma.question.findFirst({
      where: { quizId },
      orderBy: { order: "desc" },
    });

    const question = await prisma.question.create({
      data: {
        text,
        type: type || "multiple_choice",
        order: lastQuestion ? lastQuestion.order + 1 : 1,
        quizId,
        options: {
          create:
            type === "multiple_choice" && options
              ? options.map((opt: { text: string; isCorrect: boolean }) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                }))
              : [],
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}