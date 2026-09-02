import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId } = await request.json();

    if (!enrollmentId) {
      return NextResponse.json({ error: "Enrollment ID is required" }, { status: 400 });
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove enrollment error:", error);
    return NextResponse.json({ error: "Failed to remove enrollment" }, { status: 500 });
  }
}