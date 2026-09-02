import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateModuleForm from "@/components/CreateModuleForm";
import CreateLiveSessionForm from "@/components/CreateLiveSessionForm";

export default async function LecturerCourseContentPage({
  params,
}: {
  params: { id: string };
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
    where: { id: params.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
          _count: {
            select: {
              lessons: true,
              assignments: true,
              quizzes: true,
            },
          },
        },
      },
      liveSessions: {
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!course || course.lecturerId !== lecturer.id) {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <LecturerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
  <div className="px-4 sm:px-6 lg:px-8 py-4">
    <Link
      href="/lecturer/courses"
      className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
    >
      ← Back to My Courses
    </Link>
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {course.code} – {course.title}
        </h1>
        <p className="text-sm text-slate-500">
          Manage modules, lessons, quizzes, assignments and live classes
        </p>
      </div>
      <Link
        href={`/lecturer/courses/${course.id}/forum`}
        className="px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
      >
        Discussion Forum
      </Link>
    </div>
  </div>
</header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreateLiveSessionForm courseId={course.id} />
            <CreateModuleForm courseId={course.id} />
          </div>

          {/* Live Classes */}
          {course.liveSessions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Upcoming Live Classes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {course.liveSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
                  >
                    <p className="font-semibold text-slate-800 mb-1">
                      {session.title}
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      {new Date(session.scheduledAt).toLocaleString()} ·{" "}
                      {session.duration} min
                    </p>
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700"
                    >
                      Join Link
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Modules */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Modules ({course.modules.length})
              </h2>
            </div>

            {course.modules.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
                No modules yet. Create your first module above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    {/* Card Header */}
                    <div className="h-2 bg-gradient-to-r from-navy-600 to-acosat-red" />
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-navy-50 text-navy-700">
                          Module {index + 1}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-800 text-lg mb-1">
                        {module.title}
                      </h3>
                      
                      {module.description && (
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                          {module.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-navy-500" />
                          {module._count.lessons} Lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {module._count.assignments} Assignments
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {module._count.quizzes} Quizzes
                        </span>
                      </div>

                      {/* Lessons Preview */}
                      {module.lessons.length > 0 && (
                        <div className="mb-4 space-y-1">
                          {module.lessons.slice(0, 3).map((lesson, i) => (
                            <p key={lesson.id} className="text-xs text-slate-600">
                              {i + 1}. {lesson.title}
                            </p>
                          ))}
                          {module.lessons.length > 3 && (
                            <p className="text-xs text-slate-400">
                              +{module.lessons.length - 3} more...
                            </p>
                          )}
                        </div>
                      )}

                      <Link
                        href={`/lecturer/courses/${course.id}/modules/${module.id}`}
                        className="block w-full text-center px-4 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 transition"
                      >
                        Manage Module
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}