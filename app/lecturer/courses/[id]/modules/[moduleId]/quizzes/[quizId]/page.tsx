import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateQuestionForm from "@/components/CreateQuestionForm";
import EditQuestionForm from "@/components/EditQuestionForm";

export default async function QuizQuestionsPage({
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
        orderBy: { order: "asc" },
        include: {
          options: true,
        },
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
              href={`/lecturer/courses/${params.id}/modules/${params.moduleId}`}
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Module
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{quiz.title}</h1>
                <p className="text-sm text-slate-500">
                  Add questions to this quiz
                </p>
              </div>
              <Link
                href={`/lecturer/courses/${params.id}/modules/${params.moduleId}/quizzes/${params.quizId}/attempts`}
                className="px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
              >
                View Student Attempts
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <CreateQuestionForm quizId={quiz.id} />

          {/* Questions List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Questions ({quiz.questions.length})
              </h2>
            </div>

            {quiz.questions.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No questions yet. Add the first question above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 mb-1">
                          {index + 1}. {question.text}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          Type:{" "}
                          {question.type === "short_answer"
                            ? "Short Answer"
                            : "Multiple Choice"}
                        </p>
                        <div className="ml-4 space-y-1">
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className={`text-sm ${
                                option.isCorrect
                                  ? "text-emerald-600 font-medium"
                                  : "text-slate-600"
                              }`}
                            >
                              {option.isCorrect ? "✓ " : "○ "}
                              {option.text}
                            </div>
                          ))}
                        </div>

                        {/* Edit Button */}
                        <div className="mt-3">
                          <EditQuestionForm question={question} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}