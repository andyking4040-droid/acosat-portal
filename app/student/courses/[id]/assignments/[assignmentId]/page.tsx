import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SubmitAssignmentForm from "@/components/SubmitAssignmentForm";

export default async function StudentAssignmentPage({
  params,
}: {
  params: { id: string; assignmentId: string };
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

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.assignmentId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      submissions: {
        where: { studentId: student.id },
      },
    },
  });

  if (!assignment || assignment.module.courseId !== params.id) {
    notFound();
  }

  const existingSubmission = assignment.submissions[0];

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
            <h1 className="text-xl font-bold text-slate-800">
              {assignment.title}
            </h1>
            <p className="text-sm text-slate-500">
              {assignment.module.course.code} · Max score: {assignment.maxScore}
              {assignment.dueDate &&
                ` · Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6">
          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-3">Instructions</h2>
            <p className="text-slate-700 whitespace-pre-wrap">
              {assignment.description || "No instructions provided."}
            </p>
          </div>

          {/* Submission */}
          {existingSubmission ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">
                Your Submission
              </h2>
              <p className="text-sm text-slate-500 mb-2">
                Submitted on{" "}
                {new Date(existingSubmission.submittedAt).toLocaleString()}
              </p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {existingSubmission.content || "No content"}
              </div>
              {existingSubmission.score !== null && (
                <p className="mt-4 text-navy-700 font-semibold">
                  Score: {existingSubmission.score} / {assignment.maxScore}
                </p>
              )}
              {existingSubmission.feedback && (
                <div className="mt-3 text-sm">
                  <p className="text-slate-500">Feedback:</p>
                  <p className="text-slate-700">{existingSubmission.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <SubmitAssignmentForm assignmentId={assignment.id} />
          )}
        </main>
      </div>
    </div>
  );
}