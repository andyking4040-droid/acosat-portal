import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function GradeEntryPage() {
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

  const courses = await prisma.course.findMany({
    where: { lecturerId: lecturer.id },
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
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <LecturerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Grade Entry</h1>
            <p className="text-sm text-slate-500">
              Select a course to enter and publish student grades
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              You are not assigned to any courses yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-1.5 bg-gradient-to-r from-navy-600 to-acosat-red" />
                  <div className="p-5">
                    <p className="text-xs font-bold text-navy-600 mb-1">
                      {course.code}
                    </p>
                    <h3 className="font-semibold text-slate-800 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {course._count.enrollments} student
                      {course._count.enrollments === 1 ? "" : "s"} enrolled
                    </p>

                    {course._count.enrollments === 0 ? (
                      <span className="inline-block px-4 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-xl">
                        No students yet
                      </span>
                    ) : (
                      <Link
                        href={`/lecturer/grades/${course.id}`}
                        className="inline-block px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 transition"
                      >
                        Enter Grades →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}