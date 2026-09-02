import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function QuizAttemptsPage({
  params,
}: {
  params: { id: string; moduleId: string; quizId: string };
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

  const quiz = await prisma.quiz.findUnique({
    where: { id: params.quizId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      questions: {
        include: {
          options: true,
        },
        orderBy: { order: "asc" },
      },
      attempts: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (
    !quiz ||
    quiz.moduleId !== params.moduleId ||
    quiz.module.course.lecturerId !== lecturer.id
  ) {
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
              href={`/lecturer/courses/${params.id}/modules/${params.moduleId}/quizzes/${params.quizId}`}
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Questions
            </Link>
            <h1 className="text-xl font-bold text-slate-800">
              {quiz.title} – Student Attempts
            </h1>
            <p className="text-sm text-slate-500">
              {quiz.attempts.length} student(s) have taken this quiz
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {quiz.attempts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              No students have attempted this quiz yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">Student</th>
                      <th className="text-left font-medium px-4 py-3">Email</th>
                      <th className="text-left font-medium px-4 py-3">Score</th>
                      <th className="text-left font-medium px-4 py-3">Submitted</th>
                      <th className="text-left font-medium px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quiz.attempts.map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {attempt.student.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {attempt.student.email}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-navy-700">
                            {attempt.score} / {attempt.maxScore}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {attempt.completedAt
                            ? new Date(attempt.completedAt).toLocaleString()
                            : "In progress"}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/lecturer/courses/${params.id}/modules/${params.moduleId}/quizzes/${params.quizId}/attempts/${attempt.id}`}
                            className="text-navy-600 hover:text-navy-800 font-medium text-sm"
                          >
                            View & Grade →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}