import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, courseId, assessment, score, letterGrade, comments } =
      body;

    if (!studentId || !courseId || !assessment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a grade for this student + course + assessment already exists
    const existing = await prisma.grade.findFirst({
      where: {
        studentId,
        courseId,
        assessment,
      },
    });

    let grade;

    if (existing) {
      // Update existing grade
      grade = await prisma.grade.update({
        where: { id: existing.id },
        data: {
          score: score !== "" && score !== null ? Number(score) : null,
          letterGrade: letterGrade || null,
          comments: comments || null,
        },
      });
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: {
          studentId,
          courseId,
          assessment,
          score: score !== "" && score !== null ? Number(score) : null,
          letterGrade: letterGrade || null,
          comments: comments || null,
        },
      });
    }

    return NextResponse.json({ success: true, grade });
  } catch (error) {
    console.error("Grade save error:", error);
    return NextResponse.json(
      { error: "Failed to save grade" },
      { status: 500 }
    );
  }
}