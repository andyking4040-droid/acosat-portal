import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, lecturerId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        lecturerId: lecturerId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assign lecturer error:", error);
    return NextResponse.json({ error: "Failed to assign lecturer" }, { status: 500 });
  }
}