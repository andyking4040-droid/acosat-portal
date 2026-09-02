import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CertificatesPage() {
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

  const certificates = await prisma.certificate.findMany({
    where: { studentId: student.id },
    include: {
      course: {
        select: { code: true, title: true },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-acosat-red to-navy-700 z-50" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">My Certificates</h1>
              <p className="text-sm text-slate-500">
                Certificates you have earned
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy-700 text-white flex items-center justify-center font-semibold text-sm">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {certificates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
              <p className="text-lg mb-2">No certificates yet</p>
              <p className="text-sm">
                Certificates will appear here once they are issued by the institution.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="h-2 bg-gradient-to-r from-navy-600 to-acosat-red" />
                  <div className="p-5">
                    <p className="text-xs font-semibold text-navy-600 mb-1">
                      {cert.course.code}
                    </p>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {cert.course.title}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      {cert.fileUrl ? (
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-navy-700 text-white text-xs font-medium rounded-lg hover:bg-navy-800"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">No file</span>
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