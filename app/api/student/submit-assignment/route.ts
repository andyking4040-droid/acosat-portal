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

    const { assignmentId, content } = await request.json();

    if (!assignmentId || !content) {
      return NextResponse.json(
        { error: "Assignment ID and content are required" },
        { status: 400 }
      );
    }

    // Check if already submitted
    const existing = await prisma.submission.findFirst({
      where: {
        studentId: student.id,
        assignmentId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted this assignment" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        studentId: student.id,
        assignmentId,
        content,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Submit assignment error:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}