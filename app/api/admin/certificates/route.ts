import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, courseId, title, fileUrl } = await request.json();

    if (!studentId || !courseId || !title) {
      return NextResponse.json(
        { error: "Student, course and title are required" },
        { status: 400 }
      );
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        courseId,
        title,
        fileUrl: fileUrl || null,
      },
    });

    return NextResponse.json({ success: true, certificate });
  } catch (error) {
    console.error("Issue certificate error:", error);
    return NextResponse.json(
      { error: "Failed to issue certificate" },
      { status: 500 }
    );
  }
}