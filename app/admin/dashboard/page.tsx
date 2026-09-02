import AdminSidebar from "@/components/layout/AdminSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const [
    totalStudents,
    totalLecturers,
    totalCourses,
    totalEnrollments,
    totalCertificates,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "lecturer" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { select: { name: true } },
        course: { select: { code: true, title: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">
                American College of Science and Technology · Online Portal
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center font-semibold text-sm">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard label="Total Students" value={totalStudents} />
            <StatCard label="Active Lecturers" value={totalLecturers} />
            <StatCard label="Active Courses" value={totalCourses} />
            <StatCard label="Total Enrollments" value={totalEnrollments} />
            <StatCard label="Certificates Issued" value={totalCertificates} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Enrollments */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Recent Enrollments</h2>
                <Link
                  href="/admin/students"
                  className="text-sm text-navy-600 hover:text-navy-800"
                >
                  View all →
                </Link>
              </div>

              {recentEnrollments.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500 text-sm">
                  No enrollments yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-medium px-6 py-3">Student</th>
                        <th className="text-left font-medium px-4 py-3">Course</th>
                        <th className="text-left font-medium px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentEnrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-800">
                            {enrollment.student.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {enrollment.course.code} – {enrollment.course.title}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/courses"
                  className="block w-full text-center px-4 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
                >
                  Manage Courses
                </Link>
                <Link
                  href="/admin/students"
                  className="block w-full text-center px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                >
                  Manage Students
                </Link>
                <Link
                  href="/admin/certificates"
                  className="block w-full text-center px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                >
                  Issue Certificate
                </Link>
                <Link
                  href="/admin/reports"
                  className="block w-full text-center px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50"
                >
                  View Reports
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}