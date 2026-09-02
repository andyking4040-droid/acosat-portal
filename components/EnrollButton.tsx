"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleEnroll = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to enroll");
      } else {
        setMessage("Enrolled successfully!");
        router.refresh(); // Refresh the page data
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white text-sm font-medium rounded-xl transition disabled:opacity-60"
      >
        {loading ? "Enrolling..." : "Enroll"}
      </button>
      {message && (
        <span className="text-xs text-emerald-600">{message}</span>
      )}
    </div>
  );
}