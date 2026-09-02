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

    const { quizId, answers } = await request.json();

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: "Quiz ID and answers are required" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if already completed
    const existing = await prisma.quizAttempt.findFirst({
      where: {
        studentId: student.id,
        quizId,
        completedAt: { not: null },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already completed this quiz" },
        { status: 400 }
      );
    }

    // Grade and prepare answers
    let score = 0;
    let maxScore = 0;
    const answerRecords = [];

    for (const question of quiz.questions) {
      maxScore += question.points;
      const studentAnswer = answers[question.id];

      if (question.type === "multiple_choice") {
        const correctOption = question.options.find((o) => o.isCorrect);
        const isCorrect =
          studentAnswer && correctOption && studentAnswer === correctOption.id;

        if (isCorrect) {
          score += question.points;
        }

        answerRecords.push({
          questionId: question.id,
          selectedOptionId: studentAnswer || null,
          textAnswer: null,
          isCorrect: !!isCorrect,
          pointsAwarded: isCorrect ? question.points : 0,
        });
      } else {
        // Short Answer – not auto-graded
        answerRecords.push({
          questionId: question.id,
          selectedOptionId: null,
          textAnswer: studentAnswer || null,
          isCorrect: null,
          pointsAwarded: null,
        });
      }
    }

    // Create the attempt + all answers
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: student.id,
        quizId,
        score,
        maxScore,
        completedAt: new Date(),
        answers: {
          create: answerRecords,
        },
      },
    });

    return NextResponse.json({
      success: true,
      score,
      maxScore,
      message:
        score === maxScore
          ? "Perfect score! Excellent work."
          : "Quiz submitted successfully.",
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}