import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateForumPostForm from "@/components/CreateForumPostForm";

export default async function StudentCourseForumPage({
  params,
}: {
  params: { id: string };
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

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      forumPosts: {
        include: {
          author: {
            select: { name: true, role: true },
          },
          _count: {
            select: { replies: true },
          },
          reads: {
            where: {
              userId: student.id,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const unreadCount = course.forumPosts.filter(
    (post) => post.reads.length === 0
  ).length;

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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">
                Discussion Forum
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {course.code} – {course.title}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <CreateForumPostForm courseId={course.id} />

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Posts ({course.forumPosts.length})
              </h2>
            </div>

            {course.forumPosts.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No posts yet. Be the first to start a discussion!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {course.forumPosts.map((post) => {
                  const isUnread = post.reads.length === 0;

                  return (
                    <Link
                      key={post.id}
                      href={`/student/courses/${params.id}/forum/${post.id}`}
                      className="block px-6 py-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        {isUnread && (
                          <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`mb-1 ${
                              isUnread
                                ? "font-bold text-slate-900"
                                : "font-medium text-slate-800"
                            }`}
                          >
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                              {post.author.name}
                              {post.author.role === "lecturer" && (
                                <span className="ml-1 text-navy-600 font-medium">
                                  (Lecturer)
                                </span>
                              )}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                            <span>·</span>
                            <span>{post._count.replies} replies</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}