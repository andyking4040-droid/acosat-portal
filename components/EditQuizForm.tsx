"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
};

export default function EditQuizForm({ quiz }: { quiz: Quiz }) {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description || "");
  const [timeLimit, setTimeLimit] = useState(
    quiz.timeLimit ? String(quiz.timeLimit) : ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/quizzes/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          title,
          description,
          timeLimit: timeLimit ? Number(timeLimit) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update quiz");
      } else {
        setMessage("Quiz updated successfully!");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-xs font-medium text-navy-700 border border-navy-200 rounded-lg hover:bg-navy-50"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3">
      <h3 className="font-medium text-slate-800 mb-3">Edit Quiz</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          placeholder="Quiz title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          placeholder="Description"
        />
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          min={1}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
          placeholder="Time limit (minutes)"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-navy-700 text-white text-sm rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
        {message && (
          <p className="text-sm text-emerald-600">{message}</p>
        )}
      </form>
    </div>
  );
}