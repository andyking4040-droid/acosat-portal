import AdminSidebar from "@/components/layout/AdminSidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AssignLecturerForm from "@/components/AssignLecturerForm";
import CreateCourseForm from "@/components/CreateCourseForm";
import DeleteCourseButton from "@/components/DeleteCourseButton";
import EditCourseForm from "@/components/EditCourseForm";
import SearchInput from "@/components/SearchInput";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const courses = await prisma.course.findMany({
    include: {
      lecturer: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { code: "asc" },
  });

  const lecturers = await prisma.user.findMany({
    where: { role: "lecturer" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const q = (params.q || "").toLowerCase().trim();

  const filteredCourses = q
    ? courses.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.department || "").toLowerCase().includes(q) ||
          (c.lecturer?.name || "").toLowerCase().includes(q)
      )
    : courses;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Course Management
              </h1>
              <p className="text-sm text-slate-500">
                Create courses and assign lecturers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput placeholder="Search courses..." />
              <CreateCourseForm lecturers={lecturers} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">Code</th>
                    <th className="text-left font-medium px-4 py-3">Title</th>
                    <th className="text-left font-medium px-4 py-3">
                      Department
                    </th>
                    <th className="text-left font-medium px-4 py-3">
                      Students
                    </th>
                    <th className="text-left font-medium px-4 py-3">
                      Current Lecturer
                    </th>
                    <th className="text-left font-medium px-4 py-3">
                      Assign Lecturer
                    </th>
                    <th className="text-left font-medium px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-navy-700">
                        {course.code}
                      </td>
                      <td className="px-4 py-4">{course.title}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {course.department || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {course._count.enrollments}
                      </td>
                      <td className="px-4 py-4">
                        {course.lecturer ? (
                          <span className="text-slate-800">
                            {course.lecturer.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <AssignLecturerForm
                          courseId={course.id}
                          currentLecturerId={course.lecturerId}
                          lecturers={lecturers}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <EditCourseForm course={course} />
                          <DeleteCourseButton
                            courseId={course.id}
                            courseCode={course.code}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCourses.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-500">
                {q
                  ? "No courses match your search."
                  : "No courses yet. Click “Create Course” to add one."}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}