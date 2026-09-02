import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function StudentCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "student") {
    redirect("/login");
  }

  const student = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!student) {
    redirect("/login");
  }

  // Check if the student is enrolled in this course
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: params.id,
      },
    },
  });

  if (!enrollment) {
    notFound();
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      lecturer: {
        select: { name: true },
      },
      liveSessions: {
        orderBy: { scheduledAt: "asc" },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: {
                  studentId: student.id,
                },
              },
            },
          },
          quizzes: {
            orderBy: { createdAt: "desc" },
          },
          assignments: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Calculate progress
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(
    (lesson) => lesson.progress.length > 0
  ).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/student/dashboard"
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {course.code} – {course.title}
                </h1>
                <p className="text-sm text-slate-500">
                  Lecturer: {course.lecturer?.name || "TBA"} · {course.credits} Credits
                </p>
              </div>
              <Link
                href={`/student/courses/${course.id}/forum`}
                className="px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
              >
                Discussion Forum
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Live Classes */}
          {course.liveSessions.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50">
                <h2 className="font-semibold text-slate-800">
                  Upcoming Live Classes
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {course.liveSessions.map((session) => (
                  <div
                    key={session.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {session.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(session.scheduledAt).toLocaleString()}
                        {session.duration && ` · ${session.duration} minutes`}
                      </p>
                      {session.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {session.description}
                        </p>
                      )}
                    </div>
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700"
                    >
                      Join Class
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Progress */}
          {totalLessons > 0 && (
            <div className="mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-slate-800">Your Progress</h2>
                <span className="text-sm font-medium text-navy-700">
                  {completedLessons} / {totalLessons} lessons ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-navy-600 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {course.modules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              No content has been added to this course yet.
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, index) => (
                <div
                  key={module.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  {/* Module Header */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-semibold text-slate-800">
                      Module {index + 1}: {module.title}
                    </h2>
                    {module.description && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {module.description}
                      </p>
                    )}
                  </div>

                  {/* Module Slides */}
                  {module.slidesUrl && (
                    <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 text-sm font-bold">
                              PPT
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">
                              {module.slidesTitle || "Module Slides"}
                            </p>
                            <p className="text-xs text-slate-500">
                              PowerPoint / Presentation Slides
                            </p>
                          </div>
                        </div>
                        <a
                          href={module.slidesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
                        >
                          View / Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Lessons */}
                  {module.lessons.length === 0 ? (
                    <div className="px-6 py-6 text-sm text-slate-500">
                      No lessons in this module yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = lesson.progress.length > 0;

                        return (
                          <Link
                            key={lesson.id}
                            href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                            className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isCompleted
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-navy-100 text-navy-700"
                                }`}
                              >
                                {isCompleted ? "✓" : lessonIndex + 1}
                              </span>
                              <div>
                                <p className="font-medium text-slate-800">
                                  {lesson.title}
                                </p>
                                {lesson.videoUrl && (
                                  <p className="text-xs text-slate-500">
                                    Includes video
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm">
                              {isCompleted ? (
                                <span className="text-emerald-600 font-medium">
                                  Completed
                                </span>
                              ) : (
                                <span className="text-navy-600">View →</span>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Quizzes */}
                  {module.quizzes.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">
                        QUIZZES
                      </p>
                      <div className="space-y-2">
                        {module.quizzes.map((quiz) => (
                          <Link
                            key={quiz.id}
                            href={`/student/courses/${course.id}/quizzes/${quiz.id}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-navy-50 hover:bg-navy-100 transition"
                          >
                            <div>
                              <p className="font-medium text-slate-800 text-sm">
                                {quiz.title}
                              </p>
                              {quiz.timeLimit && (
                                <p className="text-xs text-slate-500">
                                  Time limit: {quiz.timeLimit} minutes
                                </p>
                              )}
                            </div>
                            <span className="text-navy-700 text-sm font-medium">
                              Start →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assignments */}
                  {module.assignments.length > 0 && (
                    <div className="px-6 py-3 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">
                        ASSIGNMENTS
                      </p>
                      <div className="space-y-2">
                        {module.assignments.map((assignment) => (
                          <Link
                            key={assignment.id}
                            href={`/student/courses/${course.id}/assignments/${assignment.id}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition"
                          >
                            <div>
                              <p className="font-medium text-slate-800 text-sm">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                Max score: {assignment.maxScore}
                                {assignment.dueDate &&
                                  ` · Due: ${new Date(
                                    assignment.dueDate
                                  ).toLocaleDateString()}`}
                              </p>
                            </div>
                            <span className="text-amber-700 text-sm font-medium">
                              Submit →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}