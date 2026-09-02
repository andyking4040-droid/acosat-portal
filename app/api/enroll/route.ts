import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Get the current student
    const student = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 });
    }

    // Create the enrollment
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: courseId,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, message: "Successfully enrolled" });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}