import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";
import EnrollButton from "@/components/EnrollButton";

export default async function CourseCatalogPage() {
  const courses = await prisma.course.findMany({
    orderBy: { code: "asc" },
    include: {
      lecturer: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-xl font-bold text-slate-800">Course Catalog</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Browse and enroll in online university courses
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {courses.length}
              </span>{" "}
              courses available
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-500">
              No courses found in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-navy-600 via-navy-700 to-acosat-red" />

                  <div className="p-6">
                    {/* Code + Credits */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-navy-50 text-navy-700 tracking-wide">
                        {course.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {course.credits} Credits
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 leading-snug">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {course.description || "No description available."}
                    </p>

                    {/* Lecturer */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                        {(course.lecturer?.name || "T")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="text-sm text-slate-600">
                        {course.lecturer?.name || "Lecturer TBA"}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        {(!course.status || course.status === "open") && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium text-emerald-700">
                              Open
                            </span>
                          </>
                        )}
                        {course.status === "limited" && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-medium text-amber-700">
                              Limited
                            </span>
                          </>
                        )}
                        {course.status === "coming" && (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="text-xs font-medium text-slate-500">
                              Coming soon
                            </span>
                          </>
                        )}
                      </div>

                      {course.status === "coming" ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-xl cursor-not-allowed"
                        >
                          Waitlist
                        </button>
                      ) : (
                        <EnrollButton courseId={course.id} />
                      )}
                    </div>
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