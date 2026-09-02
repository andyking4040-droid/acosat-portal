"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAssignmentForm({ moduleId }: { moduleId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          title,
          description,
          maxScore: Number(maxScore),
          dueDate: dueDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create assignment");
      } else {
        setTitle("");
        setDescription("");
        setMaxScore("100");
        setDueDate("");
        setMessage("Assignment created successfully!");
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
      <h2 className="font-semibold text-slate-800 mb-4">Create New Assignment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assignment Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Research Paper on Cell Biology"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description / Instructions
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Write the assignment instructions..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Max Score
            </label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              min={1}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Assignment"}
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