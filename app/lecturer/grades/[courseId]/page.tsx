import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GradeEntryForm from "@/components/GradeEntryForm";

export default async function CourseGradeEntryPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "lecturer") {
    redirect("/login");
  }

  const lecturer = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!lecturer) {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          student: { name: "asc" },
        },
      },
    },
  });

  if (!course || course.lecturerId !== lecturer.id) {
    notFound();
  }

  const students = course.enrollments.map((e) => e.student);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <LecturerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/lecturer/grades"
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Grade Entry
            </Link>
            <h1 className="text-xl font-bold text-slate-800">
              {course.code} – {course.title}
            </h1>
            <p className="text-sm text-slate-500">
              {students.length} student{students.length === 1 ? "" : "s"}{" "}
              enrolled · Enter and publish grades
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {students.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              No students are enrolled in this course yet.
            </div>
          ) : (
            <GradeEntryForm
              courseId={course.id}
              courseCode={course.code}
              courseTitle={course.title}
              students={students}
            />
          )}
        </main>
      </div>
    </div>
  );
}