import AdminSidebar from "@/components/layout/AdminSidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import IssueCertificateForm from "@/components/IssueCertificateForm";

export default async function AdminCertificatesPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const courses = await prisma.course.findMany({
    select: { id: true, code: true, title: true },
    orderBy: { code: "asc" },
  });

  const certificates = await prisma.certificate.findMany({
    include: {
      student: { select: { name: true, email: true } },
      course: { select: { code: true, title: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-slate-800">Certificates</h1>
            <p className="text-sm text-slate-500">
              Issue and manage student certificates
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <IssueCertificateForm students={students} courses={courses} />

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                Issued Certificates ({certificates.length})
              </h2>
            </div>

            {certificates.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500">
                No certificates issued yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left font-medium px-6 py-3">Student</th>
                      <th className="text-left font-medium px-4 py-3">Course</th>
                      <th className="text-left font-medium px-4 py-3">Title</th>
                      <th className="text-left font-medium px-4 py-3">Issued</th>
                      <th className="text-left font-medium px-6 py-3">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800">
                            {cert.student.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {cert.student.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {cert.course.code} – {cert.course.title}
                        </td>
                        <td className="px-4 py-4">{cert.title}</td>
                        <td className="px-4 py-4 text-slate-500">
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {cert.fileUrl ? (
                            <a
                              href={cert.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-navy-600 hover:underline text-sm"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}