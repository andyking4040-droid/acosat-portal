import AdminSidebar from "@/components/layout/AdminSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SendNotificationForm from "@/components/SendNotificationForm";

export default async function AdminNotificationsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const notifications = await prisma.notification.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
            <p className="text-sm text-slate-500">
              Send notifications to students
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <SendNotificationForm students={students} />

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Recent Notifications
              </h2>
            </div>

            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No notifications sent yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{n.title}</p>
                        <p className="text-sm text-slate-600 mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          To: {n.user.name} ·{" "}
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}