import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GradeSAQForm from "@/components/GradeSAQForm";

export default async function GradeAttemptPage({
  params,
}: {
  params: { id: string; moduleId: string; quizId: string; attemptId: string };
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

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      student: {
        select: { id: true, name: true, email: true },
      },
      quiz: {
        include: {
          module: {
            include: { course: true },
          },
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: true,
            },
          },
        },
      },
      answers: true,
    },
  });

  if (
    !attempt ||
    attempt.quizId !== params.quizId ||
    attempt.quiz.module.course.lecturerId !== lecturer.id
  ) {
    notFound();
  }

  // Helper to get the student's answer for a question
  const getAnswer = (questionId: string) => {
    return attempt.answers.find((a) => a.questionId === questionId);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <LecturerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/lecturer/courses/${params.id}/modules/${params.moduleId}/quizzes/${params.quizId}/attempts`}
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Attempts
            </Link>
            <h1 className="text-xl font-bold text-slate-800">
              Grade Attempt – {attempt.student.name}
            </h1>
            <p className="text-sm text-slate-500">
              Current score: {attempt.score} / {attempt.maxScore}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-6">
              Student Answers
            </h2>

            <div className="space-y-8">
              {attempt.quiz.questions.map((question, index) => {
                const answer = getAnswer(question.id);

                return (
                  <div
                    key={question.id}
                    className="border-b border-slate-100 pb-6 last:border-0"
                  >
                    <p className="font-medium text-slate-800 mb-1">
                      {index + 1}. {question.text}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Type:{" "}
                      {question.type === "short_answer"
                        ? "Short Answer"
                        : "Multiple Choice"}{" "}
                      · {question.points} point(s)
                    </p>

                    {question.type === "multiple_choice" ? (
                      <div className="ml-4 space-y-1">
                        {question.options.map((option) => {
                          const isSelected =
                            answer?.selectedOptionId === option.id;
                          const isCorrect = option.isCorrect;

                          return (
                            <div
                              key={option.id}
                              className={`text-sm flex items-center gap-2 ${
                                isCorrect
                                  ? "text-emerald-600 font-medium"
                                  : isSelected
                                  ? "text-red-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {isCorrect ? "✓" : isSelected ? "✗" : "○"}{" "}
                              {option.text}
                              {isSelected && !isCorrect && (
                                <span className="text-xs">(Student chose this)</span>
                              )}
                              {isSelected && isCorrect && (
                                <span className="text-xs">(Correct)</span>
                              )}
                            </div>
                          );
                        })}
                        <p className="text-xs text-slate-500 mt-2">
                          Auto-graded · Points: {answer?.pointsAwarded ?? 0}
                        </p>
                      </div>
                    ) : (
                      <div className="ml-4 space-y-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <p className="text-xs text-slate-500 mb-1">
                            Student’s Answer:
                          </p>
                          <p className="text-sm text-slate-800 whitespace-pre-wrap">
                            {answer?.textAnswer || (
                              <span className="text-slate-400 italic">
                                No answer provided
                              </span>
                            )}
                          </p>
                        </div>

                        <GradeSAQForm
                          answerId={answer?.id}
                          questionId={question.id}
                          attemptId={attempt.id}
                          currentPoints={answer?.pointsAwarded}
                          maxPoints={question.points}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}