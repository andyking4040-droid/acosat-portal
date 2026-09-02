import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LecturerCoursesPage() {
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
      _count: {
        select: {
          enrollments: true,
          modules: true,
        },
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
            <h1 className="text-xl font-bold text-slate-800">My Courses</h1>
            <p className="text-sm text-slate-500">
              Manage course content, modules and lessons
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
                <Link
                  key={course.id}
                  href={`/lecturer/courses/${course.id}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-navy-50 text-navy-700">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {course.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>{course._count.enrollments} Students</span>
                    <span>{course._count.modules} Modules</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}