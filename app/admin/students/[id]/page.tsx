import AdminSidebar from "@/components/layout/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import RemoveEnrollmentButton from "@/components/RemoveEnrollmentButton";

export default async function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      enrollments: {
        include: {
          course: true,
        },
      },
      grades: {
        include: {
          course: {
            select: { code: true, title: true },
          },
        },
      },
    },
  });

  if (!student || student.role !== "student") {
    notFound();
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <Link
                href="/admin/students"
                className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
              >
                ← Back to Students
              </Link>
              <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Student Info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Full Name</p>
                <p className="font-medium text-slate-800">{student.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium text-slate-800">{student.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Role</p>
                <p className="font-medium text-slate-800 capitalize">{student.role}</p>
              </div>
              <div>
                <p className="text-slate-500">Joined</p>
                <p className="font-medium text-slate-800">
                  {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Enrollments */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Enrolled Courses ({student.enrollments.length})
              </h2>
            </div>

            {student.enrollments.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                This student is not enrolled in any courses.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {student.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {enrollment.course.code} – {enrollment.course.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        Status: {enrollment.status} · Enrolled:{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <RemoveEnrollmentButton enrollmentId={enrollment.id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grades */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Grades ({student.grades.length})
              </h2>
            </div>

            {student.grades.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                No grades recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">Course</th>
                      <th className="text-left font-medium px-4 py-3">Assessment</th>
                      <th className="text-left font-medium px-4 py-3">Score</th>
                      <th className="text-left font-medium px-6 py-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.grades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="px-6 py-3">
                          {grade.course.code} – {grade.course.title}
                        </td>
                        <td className="px-4 py-3">{grade.assessment}</td>
                        <td className="px-4 py-3">
                          {grade.score !== null ? grade.score : "—"}
                        </td>
                        <td className="px-6 py-3">
                          {grade.letterGrade || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}