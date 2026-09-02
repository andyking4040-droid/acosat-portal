"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  submissionId: string;
  currentScore: number | null;
  currentFeedback: string | null;
  maxScore: number;
};

export default function GradeSubmissionForm({
  submissionId,
  currentScore,
  currentFeedback,
  maxScore,
}: Props) {
  const [score, setScore] = useState(
    currentScore !== null ? String(currentScore) : ""
  );
  const [feedback, setFeedback] = useState(currentFeedback || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleGrade = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/grade-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          score: Number(score),
          feedback,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to grade");
      } else {
        setMessage("Graded successfully!");
        router.refresh();
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-100 pt-4 space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          max={maxScore}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={`0 – ${maxScore}`}
          className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
        />
        <span className="text-sm text-slate-500">/ {maxScore}</span>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={2}
        placeholder="Feedback (optional)"
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={handleGrade}
          disabled={loading}
          className="px-4 py-1.5 bg-navy-700 text-white text-sm font-medium rounded-lg hover:bg-navy-800 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Grade"}
        </button>
        {message && (
          <span className="text-sm text-emerald-600">{message}</span>
        )}
      </div>
    </div>
  );
}