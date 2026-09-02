"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lecturer = {
  id: string;
  name: string;
  email: string;
};

export default function CreateCourseForm({
  lecturers,
}: {
  lecturers: Lecturer[];
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState("3");
  const [department, setDepartment] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          title,
          description,
          credits: Number(credits),
          department,
          lecturerId: lecturerId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create course");
      } else {
        setCode("");
        setTitle("");
        setDescription("");
        setCredits("3");
        setDepartment("");
        setLecturerId("");
        setMessage("Course created successfully!");
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setMessage("");
        }, 1200);
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
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
      >
        + Create Course
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
                Create New Course
              </h2>
              <button
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
                    placeholder="e.g. HS 101"
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
                    min="1"
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
                  placeholder="e.g. Introduction to Public Health"
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
                  <option value="Business Management">Business Management</option>
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
                  placeholder="Brief course description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assign Lecturer (optional)
                </label>
                <select
                  value={lecturerId}
                  onChange={(e) => setLecturerId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="">Assign later</option>
                  {lecturers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Course"}
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