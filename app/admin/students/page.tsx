import AdminSidebar from "@/components/layout/AdminSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddUserForm from "@/components/AddUserForm";
import DeleteUserButton from "@/components/DeleteUserButton";
import EditUserForm from "@/components/EditUserForm";
import SearchInput from "@/components/SearchInput";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const [students, lecturers] = await Promise.all([
    prisma.user.findMany({
      where: { role: "student" },
      include: {
        enrollments: {
          include: {
            course: {
              select: { code: true, title: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "lecturer" },
      include: {
        courses: {
          select: { code: true, title: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const q = (params.q || "").toLowerCase().trim();

  const filteredStudents = q
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
    : students;

  const filteredLecturers = q
    ? lecturers.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      )
    : lecturers;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Users</h1>
              <p className="text-sm text-slate-500">
                Manage students and lecturers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput placeholder="Search users..." />
              <AddUserForm />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Students */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Students ({filteredStudents.length})
            </h2>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {filteredStudents.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  {q ? "No students match your search." : "No students yet."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-medium px-6 py-3">Name</th>
                        <th className="text-left font-medium px-4 py-3">Email</th>
                        <th className="text-left font-medium px-4 py-3">
                          Enrolled Courses
                        </th>
                        <th className="text-left font-medium px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-800">
                            {student.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {student.email}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {student.enrollments.length === 0 ? (
                              <span className="text-slate-400">None</span>
                            ) : (
                              <div className="space-y-0.5">
                                {student.enrollments.map((e) => (
                                  <div key={e.id} className="text-xs">
                                    {e.course.code} – {e.course.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <EditUserForm user={student} />
                              <DeleteUserButton
                                userId={student.id}
                                userName={student.name}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* Lecturers */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Lecturers ({filteredLecturers.length})
            </h2>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {filteredLecturers.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">
                  {q ? "No lecturers match your search." : "No lecturers yet."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-medium px-6 py-3">Name</th>
                        <th className="text-left font-medium px-4 py-3">Email</th>
                        <th className="text-left font-medium px-4 py-3">
                          Courses Teaching
                        </th>
                        <th className="text-left font-medium px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLecturers.map((lecturer) => (
                        <tr key={lecturer.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-800">
                            {lecturer.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {lecturer.email}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {lecturer.courses.length === 0 ? (
                              <span className="text-slate-400">None</span>
                            ) : (
                              <div className="space-y-0.5">
                                {lecturer.courses.map((c) => (
                                  <div key={c.code} className="text-xs">
                                    {c.code} – {c.title}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <EditUserForm user={lecturer} />
                              <DeleteUserButton
                                userId={lecturer.id}
                                userName={lecturer.name}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}