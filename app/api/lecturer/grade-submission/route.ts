import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const role = (session.user as any).role;

    if (role !== "lecturer") {
      return NextResponse.json(
        { error: `Access denied. Your role is: ${role || "unknown"}` },
        { status: 403 }
      );
    }

    const lecturer = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found in database" }, { status: 404 });
    }

    const body = await request.json();
    const { courseId, title, description, meetingUrl, scheduledAt, duration } = body;

    if (!courseId || !title || !meetingUrl || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify lecturer owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        lecturerId: lecturer.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or you are not assigned to this course" },
        { status: 403 }
      );
    }

    const liveSession = await prisma.liveSession.create({
      data: {
        title,
        description: description || null,
        meetingUrl,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        courseId,
      },
    });

    return NextResponse.json({ success: true, liveSession });
  } catch (error) {
    console.error("Create live session error:", error);
    return NextResponse.json(
      { error: "Failed to create live session" },
      { status: 500 }
    );
  }
}