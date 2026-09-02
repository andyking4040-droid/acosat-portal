import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateLessonForm from "@/components/CreateLessonForm";
import CreateQuizForm from "@/components/CreateQuizForm";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import UploadSlidesForm from "@/components/UploadSlidesForm";
import EditQuizForm from "@/components/EditQuizForm";
import DeleteModuleButton from "@/components/DeleteModuleButton";
import DeleteContentButton from "@/components/DeleteContentButton";

export default async function ModulePage({
  params,
}: {
  params: { id: string; moduleId: string };
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
  });

  if (!course || course.lecturerId !== lecturer.id) {
    notFound();
  }

  const module = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: {
      lessons: {
        orderBy: { order: "asc" },
      },
      quizzes: {
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!module || module.courseId !== course.id) {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <LecturerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <Link
                href={`/lecturer/courses/${course.id}`}
                className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
              >
                ← Back to {course.code}
              </Link>
              <h1 className="text-xl font-bold text-slate-800">{module.title}</h1>
              <p className="text-sm text-slate-500">
                {module.description || "Manage content for this module"}
              </p>
            </div>

            <DeleteModuleButton moduleId={module.id} courseId={course.id} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Create Forms */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <UploadSlidesForm
              moduleId={module.id}
              currentSlidesUrl={module.slidesUrl}
              currentSlidesTitle={module.slidesTitle}
            />
            <CreateLessonForm moduleId={module.id} />
            <CreateQuizForm moduleId={module.id} />
            <CreateAssignmentForm moduleId={module.id} />
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Lessons */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-navy-600" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Lessons</h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-navy-50 text-navy-700">
                    {module.lessons.length}
                  </span>
                </div>

                {module.lessons.length === 0 ? (
                  <p className="text-sm text-slate-500">No lessons yet</p>
                ) : (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {lesson.title}
                            </p>
                            {lesson.videoUrl && (
                              <p className="text-xs text-slate-500">Has video</p>
                            )}
                          </div>
                        </div>
                        <DeleteContentButton id={lesson.id} type="lesson" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quizzes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-emerald-500" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Quizzes</h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {module.quizzes.length}
                  </span>
                </div>

                {module.quizzes.length === 0 ? (
                  <p className="text-sm text-slate-500">No quizzes yet</p>
                ) : (
                  <div className="space-y-3">
                    {module.quizzes.map((quiz) => (
                      <div key={quiz.id} className="p-3 rounded-xl bg-slate-50">
                        <p className="text-sm font-medium text-slate-800 mb-1">
                          {quiz.title}
                        </p>
                        {quiz.timeLimit && (
                          <p className="text-xs text-slate-500 mb-2">
                            {quiz.timeLimit} minutes
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <EditQuizForm quiz={quiz} />
                          <Link
                            href={`/lecturer/courses/${params.id}/modules/${module.id}/quizzes/${quiz.id}`}
                            className="px-2.5 py-1 bg-navy-700 text-white text-xs font-medium rounded-lg hover:bg-navy-800"
                          >
                            Manage
                          </Link>
                          <DeleteContentButton id={quiz.id} type="quiz" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-amber-500" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Assignments</h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    {module.assignments.length}
                  </span>
                </div>

                {module.assignments.length === 0 ? (
                  <p className="text-sm text-slate-500">No assignments yet</p>
                ) : (
                  <div className="space-y-3">
                    {module.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="p-3 rounded-xl bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-800 mb-1">
                          {assignment.title}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          Max: {assignment.maxScore}
                          {assignment.dueDate &&
                            ` · Due ${new Date(
                              assignment.dueDate
                            ).toLocaleDateString()}`}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/lecturer/courses/${params.id}/modules/${module.id}/assignments/${assignment.id}`}
                            className="inline-block px-2.5 py-1 bg-navy-700 text-white text-xs font-medium rounded-lg hover:bg-navy-800"
                          >
                            View Submissions
                          </Link>
                          <DeleteContentButton
                            id={assignment.id}
                            type="assignment"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}