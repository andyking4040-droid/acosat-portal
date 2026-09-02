"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  lessonId: string;
  isCompleted: boolean;
};

export default function MarkLessonComplete({ lessonId, isCompleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);
  const router = useRouter();

  const handleMarkComplete = async () => {
    if (completed) return;

    setLoading(true);

    try {
      const res = await fetch("/api/student/complete-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      const data = await res.json();

      if (res.ok) {
        setCompleted(true);
        router.refresh();
      } else {
        alert(data.error || "Failed to mark as completed");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl">
        ✓ Completed
      </div>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={loading}
      className="px-4 py-2 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
    >
      {loading ? "Saving..." : "Mark as Completed"}
    </button>
  );
}