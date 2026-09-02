import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, title, description, credits, department, lecturerId } =
      await request.json();

    if (!code || !title) {
      return NextResponse.json(
        { error: "Course code and title are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.course.findFirst({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A course with this code already exists" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        code,
        title,
        description: description || null,
        credits: credits || 3,
        department: department || null,
        lecturerId: lecturerId || null,
        status: "open",
      },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create course" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      courseId,
      code,
      title,
      description,
      credits,
      department,
      status,
    } = await request.json();

    if (!courseId || !code || !title) {
      return NextResponse.json(
        { error: "Course ID, code and title are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const codeTaken = await prisma.course.findFirst({
      where: {
        code,
        NOT: { id: courseId },
      },
    });

    if (codeTaken) {
      return NextResponse.json(
        { error: "Another course already uses this code" },
        { status: 400 }
      );
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        code,
        title,
        description: description || null,
        credits: credits || 3,
        department: department || null,
        status: status || "open",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update course error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete course error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}