"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credits?: number | null;
  department?: string | null;
  status?: string | null;
};

export default function EditCourseForm({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(course.code || "");
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const [credits, setCredits] = useState(String(course.credits || 3));
  const [department, setDepartment] = useState(course.department || "");
  const [status, setStatus] = useState(course.status || "open");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          code,
          title,
          description,
          credits: Number(credits),
          department,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update course");
      } else {
        setMessage("Course updated successfully!");
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setMessage("");
        }, 1000);
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Edit Course
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    required
                    min={1}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="">Select department</option>
                  <option value="Health Science">Health Science</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Business Management">
                    Business Management
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited</option>
                  <option value="coming">Coming soon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.includes("success")
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}