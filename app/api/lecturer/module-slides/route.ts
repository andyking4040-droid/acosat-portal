import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const formData = await request.formData();
    const moduleId = formData.get("moduleId") as string;
    const slidesTitle = (formData.get("slidesTitle") as string) || "";
    const file = formData.get("file") as File | null;

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

    let slidesUrl = module.slidesUrl;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "slides");
      await mkdir(uploadDir, { recursive: true });

      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      slidesUrl = `/uploads/slides/${uniqueName}`;
    }

    await prisma.module.update({
      where: { id: moduleId },
      data: {
        slidesTitle: slidesTitle || null,
        slidesUrl: slidesUrl || null,
      },
    });

    return NextResponse.json({ success: true, slidesUrl });
  } catch (error) {
    console.error("Upload slides error:", error);
    return NextResponse.json(
      { error: "Failed to upload slides" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const moduleId = body.moduleId;

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

    await prisma.module.update({
      where: { id: moduleId },
      data: {
        slidesUrl: null,
        slidesTitle: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove slides error:", error);
    return NextResponse.json(
      { error: "Failed to remove slides" },
      { status: 500 }
    );
  }
}