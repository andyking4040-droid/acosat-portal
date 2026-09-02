import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StudentLibraryPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "student") {
    redirect("/login");
  }

  const resources = await prisma.libraryResource.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Group by category
  const categories = Array.from(
    new Set(resources.map((r) => r.category))
  ).sort();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Online Library</h1>
            <p className="text-sm text-slate-500">
              Access learning resources and e-books
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {resources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              No resources available yet.
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryResources = resources.filter(
                  (r) => r.category === category
                );

                return (
                  <div key={category}>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                      {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {categoryResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-navy-50 text-navy-700">
                              {resource.category}
                            </span>
                          </div>

                          <h3 className="font-semibold text-slate-800 mb-1">
                            {resource.title}
                          </h3>

                          {resource.description && (
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                              {resource.description}
                            </p>
                          )}

                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 transition"
                          >
                            Open Resource →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}