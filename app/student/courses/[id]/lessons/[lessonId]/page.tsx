import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MarkLessonComplete from "@/components/MarkLessonComplete";

export default async function StudentLessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
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

  // Check enrollment
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

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!lesson || lesson.module.courseId !== params.id) {
    notFound();
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId: params.lessonId,
      },
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/student/courses/${params.id}`}
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Course
            </Link>
            <h1 className="text-xl font-bold text-slate-800">{lesson.title}</h1>
            <p className="text-sm text-slate-500">
              {lesson.module.course.code} · {lesson.module.title}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            {/* Video */}
            {lesson.videoUrl && (
              <div className="mb-8">
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden">
                  <iframe
                    src={lesson.videoUrl.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                    title={lesson.title}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="prose max-w-none mb-8">
              {lesson.content ? (
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {lesson.content}
                </div>
              ) : (
                <p className="text-slate-500">
                  No content available for this lesson.
                </p>
              )}
            </div>

            {/* Mark as Completed */}
            <div className="pt-6 border-t border-slate-100">
              <MarkLessonComplete
                lessonId={lesson.id}
                isCompleted={!!progress}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}