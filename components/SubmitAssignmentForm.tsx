"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitAssignmentForm({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/student/submit-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to submit assignment");
      } else {
        setMessage("Assignment submitted successfully!");
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
      <h2 className="font-semibold text-slate-800 mb-4">Submit Your Work</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Answer / Submission
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            placeholder="Type or paste your assignment submission here..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Assignment"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes("success")
                  ? "text-emerald-600"
                  : "text-red-600"
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