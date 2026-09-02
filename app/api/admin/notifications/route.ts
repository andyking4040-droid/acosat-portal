import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, title, message } = await request.json();

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "Student, title and message are required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}