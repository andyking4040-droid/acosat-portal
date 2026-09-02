import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateForumReplyForm from "@/components/CreateForumReplyForm";

export default async function ForumPostPage({
  params,
}: {
  params: { id: string; postId: string };
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

  const post = await prisma.forumPost.findUnique({
    where: { id: params.postId },
    include: {
      author: {
        select: { name: true, role: true },
      },
      course: {
        select: { code: true, title: true },
      },
      replies: {
        include: {
          author: {
            select: { name: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post || post.courseId !== params.id) {
    notFound();
  }

  // Mark post as read
  await prisma.forumPostRead.upsert({
    where: {
      userId_postId: {
        userId: student.id,
        postId: params.postId,
      },
    },
    update: {},
    create: {
      userId: student.id,
      postId: params.postId,
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/student/courses/${params.id}/forum`}
              className="text-sm text-navy-600 hover:text-navy-800 mb-1 inline-block"
            >
              ← Back to Forum
            </Link>
            <h1 className="text-xl font-bold text-slate-800">{post.title}</h1>
            <p className="text-sm text-slate-500">
              {post.course.code} · Posted by {post.author.name}
              {post.author.role === "lecturer" && " (Lecturer)"}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6">
          {/* Original Post */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Replies */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Replies ({post.replies.length})
              </h2>
            </div>

            {post.replies.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                No replies yet. Be the first to reply!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {post.replies.map((reply) => (
                  <div key={reply.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-800 text-sm">
                        {reply.author.name}
                      </span>
                      {reply.author.role === "lecturer" && (
                        <span className="text-xs text-navy-600 font-medium">
                          (Lecturer)
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        · {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form */}
          <CreateForumReplyForm postId={post.id} />
        </main>
      </div>
    </div>
  );
}