import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GradeSubmissionForm from "@/components/GradeSubmissionForm";

export default async function AssignmentSubmissionsPage({
  params,
}: {
  params: { id: string; moduleId: string; assignmentId: string };
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

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (
    !assignment ||
    assignment.moduleId !== params.moduleId ||
    assignment.module.course.lecturerId !== lecturer.id
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
            <h1 className="text-xl font-bold text-slate-800">
              {assignment.title}
            </h1>
            <p className="text-sm text-slate-500">
              {assignment.submissions.length} submission(s) · Max score:{" "}
              {assignment.maxScore}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {assignment.submissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              No students have submitted this assignment yet.
            </div>
          ) : (
            assignment.submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {submission.student.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {submission.student.email} · Submitted{" "}
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {submission.score !== null && (
                    <span className="px-3 py-1 bg-navy-50 text-navy-700 text-sm font-semibold rounded-full">
                      {submission.score} / {assignment.maxScore}
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap mb-4">
                  {submission.content || "No content"}
                </div>

                <GradeSubmissionForm
                  submissionId={submission.id}
                  currentScore={submission.score}
                  currentFeedback={submission.feedback}
                  maxScore={assignment.maxScore}
                />
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}