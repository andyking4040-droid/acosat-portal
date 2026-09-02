import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentDashboardPage() {
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

  const [enrollments, notifications, liveSessions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          include: {
            lecturer: { select: { name: true } },
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: { studentId: student.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.liveSession.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId: student.id },
          },
        },
        scheduledAt: {
          gte: new Date(),
        },
      },
      include: {
        course: { select: { code: true, title: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
  ]);

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Welcome back, {student.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-slate-500">
                Here’s what’s happening with your courses
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center font-semibold text-sm">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm text-slate-500 mb-1">Enrolled Courses</p>
              <p className="text-2xl font-bold text-slate-800">
                {enrollments.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm text-slate-500 mb-1">Upcoming Classes</p>
              <p className="text-2xl font-bold text-slate-800">
                {liveSessions.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm text-slate-500 mb-1">Unread Notifications</p>
              <p className="text-2xl font-bold text-slate-800">
                {unreadNotifications}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm text-slate-500 mb-1">Total Notifications</p>
              <p className="text-2xl font-bold text-slate-800">
                {notifications.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  My Courses
                </h2>
                <Link
                  href="/student/courses"
                  className="text-sm text-navy-600 hover:text-navy-800"
                >
                  Browse Catalog →
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">
                  <p className="mb-3">You are not enrolled in any courses yet.</p>
                  <Link
                    href="/student/courses"
                    className="inline-flex px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
                  >
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrollments.map((enrollment) => {
                    const allLessons = enrollment.course.modules.flatMap(
                      (m) => m.lessons
                    );
                    const total = allLessons.length;
                    const completed = allLessons.filter(
                      (l) => l.progress.length > 0
                    ).length;
                    const percent =
                      total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                      <Link
                        key={enrollment.id}
                        href={`/student/courses/${enrollment.course.id}`}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition"
                      >
                        <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-navy-600 to-acosat-red mb-4" />
                        <p className="text-xs font-semibold text-navy-600 mb-1">
                          {enrollment.course.code}
                        </p>
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                          {enrollment.course.lecturer?.name || "TBA"}
                        </p>

                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span>
                            {completed}/{total} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-navy-600 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar widgets */}
            <div className="space-y-6">
              {/* Upcoming Live Classes */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">
                    Upcoming Live Classes
                  </h2>
                </div>
                {liveSessions.length === 0 ? (
                  <div className="px-5 py-8 text-center text-slate-500 text-sm">
                    No upcoming classes
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {liveSessions.map((session) => (
                      <div key={session.id} className="px-5 py-4">
                        <p className="font-medium text-slate-800 text-sm">
                          {session.title}
                        </p>
                        <p className="text-xs text-slate-500 mb-2">
                          {session.course.code} ·{" "}
                          {new Date(session.scheduledAt).toLocaleString()}
                        </p>
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Join Class →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">Notifications</h2>
                  <Link
                    href="/student/notifications"
                    className="text-xs text-navy-600 hover:text-navy-800"
                  >
                    View all
                  </Link>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-slate-500 text-sm">
                    No notifications
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-5 py-3">
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}