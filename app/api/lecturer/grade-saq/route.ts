import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answerId, attemptId, points } = await request.json();

    if (!attemptId || points === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the individual answer
    if (answerId) {
      await prisma.quizAnswer.update({
        where: { id: answerId },
        data: {
          pointsAwarded: points,
          isCorrect: points > 0,
        },
      });
    }

    // Recalculate the total score for the attempt
    const answers = await prisma.quizAnswer.findMany({
      where: { attemptId },
    });

    const totalScore = answers.reduce(
      (sum, a) => sum + (a.pointsAwarded || 0),
      0
    );

    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { score: totalScore },
    });

    return NextResponse.json({ success: true, newScore: totalScore });
  } catch (error) {
    console.error("Grade SAQ error:", error);
    return NextResponse.json(
      { error: "Failed to grade answer" },
      { status: 500 }
    );
  }
}