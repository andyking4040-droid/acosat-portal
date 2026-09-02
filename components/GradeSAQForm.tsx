"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  answerId?: string;
  questionId: string;
  attemptId: string;
  currentPoints: number | null | undefined;
  maxPoints: number;
};

export default function GradeSAQForm({
  answerId,
  questionId,
  attemptId,
  currentPoints,
  maxPoints,
}: Props) {
  const [points, setPoints] = useState(
    currentPoints !== null && currentPoints !== undefined
      ? String(currentPoints)
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleGrade = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/grade-saq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId,
          questionId,
          attemptId,
          points: Number(points),
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
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={0}
        max={maxPoints}
        step={0.5}
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        placeholder={`0 – ${maxPoints}`}
        className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
      />
      <span className="text-sm text-slate-500">/ {maxPoints}</span>
      <button
        onClick={handleGrade}
        disabled={loading}
        className="px-3 py-1.5 bg-navy-700 text-white text-xs font-medium rounded-lg hover:bg-navy-800 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Grade"}
      </button>
      {message && (
        <span className="text-xs text-emerald-600">{message}</span>
      )}
    </div>
  );
}