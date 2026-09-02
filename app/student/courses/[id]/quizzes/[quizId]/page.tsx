import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import TakeQuizForm from "@/components/TakeQuizForm";

export default async function StudentQuizPage({
  params,
}: {
  params: { id: string; quizId: string };
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

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz || quiz.module.courseId !== params.id) {
    notFound();
  }

  // Check if student already attempted this quiz
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      studentId: student.id,
      quizId: quiz.id,
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
            <h1 className="text-xl font-bold text-slate-800">{quiz.title}</h1>
            <p className="text-sm text-slate-500">
              {quiz.module.course.code} · {quiz.module.title}
              {quiz.timeLimit && ` · ${quiz.timeLimit} minutes`}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl">
          {existingAttempt && existingAttempt.completedAt ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Quiz Already Completed
              </h2>
              <p className="text-slate-600 mb-4">
                You scored{" "}
                <span className="font-bold text-navy-700">
                  {existingAttempt.score} / {existingAttempt.maxScore}
                </span>
              </p>
              <Link
                href={`/student/courses/${params.id}`}
                className="inline-block px-5 py-2.5 bg-navy-700 text-white rounded-xl text-sm font-medium hover:bg-navy-800"
              >
                Back to Course
              </Link>
            </div>
          ) : (
            <TakeQuizForm
              quizId={quiz.id}
              courseId={params.id}
              questions={quiz.questions}
              timeLimit={quiz.timeLimit}
            />
          )}
        </main>
      </div>
    </div>
  );
}