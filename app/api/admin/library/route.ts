import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, fileUrl, category } = await request.json();

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: "Title and file URL are required" },
        { status: 400 }
      );
    }

    const resource = await prisma.libraryResource.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        category: category || "General",
      },
    });

    return NextResponse.json({ success: true, resource });
  } catch (error) {
    console.error("Add library resource error:", error);
    return NextResponse.json(
      { error: "Failed to add resource" },
      { status: 500 }
    );
  }
}