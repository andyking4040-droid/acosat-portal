import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// CREATE MODULE
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

    const { courseId, title, description } = await request.json();

    if (!courseId || !title) {
      return NextResponse.json(
        { error: "Course ID and title are required" },
        { status: 400 }
      );
    }

    // Verify the lecturer owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        lecturerId: lecturer.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or access denied" },
        { status: 403 }
      );
    }

    // Get the next order number
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const module = await prisma.module.create({
      data: {
        title,
        description: description || null,
        order: lastModule ? lastModule.order + 1 : 1,
        courseId,
      },
    });

    return NextResponse.json({ success: true, module });
  } catch (error) {
    console.error("Create module error:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}

// DELETE MODULE
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

    const { moduleId } = await request.json();

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module || module.course.lecturerId !== lecturer.id) {
      return NextResponse.json(
        { error: "Module not found or access denied" },
        { status: 403 }
      );
    }

    await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete module error:", error);
    return NextResponse.json(
      { error: "Failed to delete module" },
      { status: 500 }
    );
  }
}