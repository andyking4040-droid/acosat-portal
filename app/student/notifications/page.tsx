import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MarkAsReadButton from "@/components/MarkAsReadButton";

export default async function StudentNotificationsPage() {
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

  const notifications = await prisma.notification.findMany({
    where: { userId: student.id },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 ${
                    notification.isRead
                      ? "border-slate-100"
                      : "border-navy-200 bg-navy-50/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-navy-600" />
                        )}
                        <h3 className="font-semibold text-slate-800">
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <MarkAsReadButton notificationId={notification.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}