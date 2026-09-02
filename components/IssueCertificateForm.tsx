"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  email: string;
};

type Course = {
  id: string;
  code: string;
  title: string;
};

type Props = {
  students: Student[];
  courses: Course[];
};

export default function IssueCertificateForm({ students, courses }: Props) {
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId,
          title,
          fileUrl: fileUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to issue certificate");
      } else {
        setStudentId("");
        setCourseId("");
        setTitle("");
        setFileUrl("");
        setMessage("Certificate issued successfully!");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-semibold text-slate-800 mb-4">Issue New Certificate</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Student
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Course
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} – {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Certificate Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Certificate of Completion – Introduction to Public Health"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Certificate File URL (optional)
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/certificate.pdf"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            Paste a link to the PDF (Google Drive, Dropbox, etc.)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Issuing..." : "Issue Certificate"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes("success") ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}