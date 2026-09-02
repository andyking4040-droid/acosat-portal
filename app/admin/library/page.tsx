import AdminSidebar from "@/components/layout/AdminSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddLibraryResourceForm from "@/components/AddLibraryResourceForm";

export default async function AdminLibraryPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const resources = await prisma.libraryResource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Online Library</h1>
            <p className="text-sm text-slate-500">
              Manage learning resources for students
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <AddLibraryResourceForm />

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Resources ({resources.length})
              </h2>
            </div>

            {resources.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No resources added yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {resource.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {resource.category}
                        {resource.description && ` · ${resource.description}`}
                      </p>
                    </div>
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-navy-700 text-white text-xs font-medium rounded-lg hover:bg-navy-800"
                    >
                      Open
                    </a>
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