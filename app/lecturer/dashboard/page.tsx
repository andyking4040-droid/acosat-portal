import LecturerSidebar from "@/components/layout/LecturerSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LecturerDashboardPage() {
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

  const [courses, liveSessions, recentPosts] = await Promise.all([
    prisma.course.findMany({
      where: { lecturerId: lecturer.id },
      include: {
        modules: {
          include: {
            _count: {
              select: {
                lessons: true,
                quizzes: true,
                assignments: true,
              },
            },
          },
        },
        enrollments: true,
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: { code: "asc" },
    }),
    prisma.liveSession.findMany({
      where: {
        course: { lecturerId: lecturer.id },
        scheduledAt: { gte: new Date() },
      },
      include: {
        course: { select: { code: true, title: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.forumPost.findMany({
      where: {
        course: { lecturerId: lecturer.id },
      },
      include: {
        author: { select: { name: true } },
        course: { select: { code: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalStudents = courses.reduce(
    (sum, c) => sum + c._count.enrollments,
    0
  );
  const totalModules = courses.reduce((sum, c) => sum + c._count.modules, 0);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <LecturerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Welcome, {lecturer.name.split(" ")[0]}
              </h1>
              <p className="text-sm text-slate-500">
                Lecturer Dashboard · ACOSAT Online Portal
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center font-semibold text-sm">
              {lecturer.name
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
            <StatCard label="My Courses" value={courses.length} />
            <StatCard label="Total Students" value={totalStudents} />
            <StatCard label="Modules" value={totalModules} />
            <StatCard label="Upcoming Classes" value={liveSessions.length} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* My Courses */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  My Courses
                </h2>
                <Link
                  href="/lecturer/courses"
                  className="text-sm text-navy-600 hover:text-navy-800"
                >
                  View all →
                </Link>
              </div>

              {courses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">
                  You are not assigned to any courses yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/lecturer/courses/${course.id}`}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition"
                    >
                      <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-navy-600 to-acosat-red mb-4" />
                      <p className="text-xs font-bold text-navy-600 mb-1">
                        {course.code}
                      </p>
                      <h3 className="font-semibold text-slate-800 mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        {course._count.enrollments} students ·{" "}
                        {course._count.modules} modules
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          {course.modules.reduce(
                            (s, m) => s + m._count.lessons,
                            0
                          )}{" "}
                          lessons
                        </span>
                        <span>
                          {course.modules.reduce(
                            (s, m) => s + m._count.quizzes,
                            0
                          )}{" "}
                          quizzes
                        </span>
                        <span>
                          {course.modules.reduce(
                            (s, m) => s + m._count.assignments,
                            0
                          )}{" "}
                          assignments
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
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
                        <p className="text-xs text-slate-500 mb-1">
                          {session.course.code} ·{" "}
                          {new Date(session.scheduledAt).toLocaleString()}
                        </p>
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Join Link →
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Forum Posts */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">
                    Recent Forum Activity
                  </h2>
                </div>
                {recentPosts.length === 0 ? (
                  <div className="px-5 py-8 text-center text-slate-500 text-sm">
                    No recent posts
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="px-5 py-3">
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">
                          {post.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {post.course.code} · {post.author.name} ·{" "}
                          {post._count.replies} replies
                        </p>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}