import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("PATCH body:", body);

    const { userId, name, email, password } = body;

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: "User ID, name and email are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const emailTaken = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (emailTaken) {
      return NextResponse.json(
        { error: "Email is already used by another account" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      email,
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log("User updated:", updated.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update user" },
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const currentAdmin = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (currentAdmin?.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin accounts" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}