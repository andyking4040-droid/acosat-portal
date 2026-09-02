import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function GradesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const student = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!student) {
    redirect("/login");
  }

  // Get all grades for this student
  const grades = await prisma.grade.findMany({
    where: { studentId: student.id },
    include: {
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get enrolled courses (even if no grades yet)
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    include: {
      course: true,
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Grades & Academic Record
              </h1>
              <p className="text-sm text-slate-500">
                Official transcript view · {student.name}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center font-semibold text-sm">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Total Grades</p>
              <p className="text-3xl font-bold text-navy-700 mt-1">
                {grades.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">
                Enrolled Courses
              </p>
              <p className="text-3xl font-bold text-navy-700 mt-1">
                {enrollments.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">
                Academic Standing
              </p>
              <p className="text-xl font-bold text-emerald-600 mt-2">
                Good Standing
              </p>
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Your Grades</h2>
            </div>

            {grades.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                <p className="mb-2">No grades have been recorded yet.</p>
                <p className="text-sm">
                  Grades will appear here once your lecturer publishes them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">
                        Course Code
                      </th>
                      <th className="text-left font-medium px-4 py-3">
                        Course Title
                      </th>
                      <th className="text-left font-medium px-4 py-3">
                        Assessment
                      </th>
                      <th className="text-left font-medium px-4 py-3">Score</th>
                      <th className="text-left font-medium px-4 py-3">Grade</th>
                      <th className="text-left font-medium px-6 py-3">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-navy-700">
                          {grade.course.code}
                        </td>
                        <td className="px-4 py-4 text-slate-800">
                          {grade.course.title}
                        </td>
                        <td className="px-4 py-4">{grade.assessment}</td>
                        <td className="px-4 py-4">
                          {grade.score !== null ? grade.score : "—"}
                        </td>
                        <td className="px-4 py-4">
                          {grade.letterGrade ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              {grade.letterGrade}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {grade.comments || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrolled Courses without grades yet */}
          {enrollments.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">
                  Currently Enrolled Courses
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="px-6 py-3 flex justify-between items-center text-sm"
                  >
                    <div>
                      <span className="font-medium text-navy-700">
                        {enrollment.course.code}
                      </span>{" "}
                      – {enrollment.course.title}
                    </div>
                    <span className="text-slate-500">
                      {enrollment.course.credits} Credits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}