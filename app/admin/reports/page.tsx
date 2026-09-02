import AdminSidebar from "@/components/layout/AdminSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminReportsPage() {
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
    totalQuizzes,
    totalAssignments,
    recentEnrollments,
    recentCertificates,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "lecturer" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.quiz.count(),
    prisma.assignment.count(),
    prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: "desc" },
      include: {
        student: { select: { name: true } },
        course: { select: { code: true, title: true } },
      },
    }),
    prisma.certificate.findMany({
      take: 5,
      orderBy: { issuedAt: "desc" },
      include: {
        student: { select: { name: true } },
        course: { select: { code: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Reports</h1>
            <p className="text-sm text-slate-500">
              Overview of platform activity and statistics
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <StatCard label="Students" value={totalStudents} color="navy" />
            <StatCard label="Lecturers" value={totalLecturers} color="emerald" />
            <StatCard label="Courses" value={totalCourses} color="amber" />
            <StatCard label="Enrollments" value={totalEnrollments} color="indigo" />
            <StatCard label="Certificates" value={totalCertificates} color="rose" />
            <StatCard label="Quizzes" value={totalQuizzes} color="cyan" />
            <StatCard label="Assignments" value={totalAssignments} color="violet" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Enrollments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Recent Enrollments</h2>
              </div>
              {recentEnrollments.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">
                  No enrollments yet
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="px-6 py-4">
                      <p className="font-medium text-slate-800 text-sm">
                        {enrollment.student.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {enrollment.course.code} – {enrollment.course.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(enrollment.enrolledAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Certificates */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Recent Certificates</h2>
              </div>
              {recentCertificates.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500 text-sm">
                  No certificates issued yet
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentCertificates.map((cert) => (
                    <div key={cert.id} className="px-6 py-4">
                      <p className="font-medium text-slate-800 text-sm">
                        {cert.student.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {cert.course.code} – {cert.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(cert.issuedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    navy: "bg-navy-50 text-navy-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
    rose: "bg-rose-50 text-rose-700",
    cyan: "bg-cyan-50 text-cyan-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color] || "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}