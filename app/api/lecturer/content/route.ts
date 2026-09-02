import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
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

    const { id, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json(
        { error: "ID and type are required" },
        { status: 400 }
      );
    }

    if (type === "lesson") {
      const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: {
          module: {
            include: { course: true },
          },
        },
      });

      if (!lesson || lesson.module.course.lecturerId !== lecturer.id) {
        return NextResponse.json(
          { error: "Lesson not found or access denied" },
          { status: 403 }
        );
      }

      await prisma.lesson.delete({ where: { id } });
    } else if (type === "quiz") {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
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

      await prisma.quiz.delete({ where: { id } });
    } else if (type === "assignment") {
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          module: {
            include: { course: true },
          },
        },
      });

      if (!assignment || assignment.module.course.lecturerId !== lecturer.id) {
        return NextResponse.json(
          { error: "Assignment not found or access denied" },
          { status: 403 }
        );
      }

      await prisma.assignment.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete content error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}