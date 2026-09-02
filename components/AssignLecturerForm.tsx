"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lecturer = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  courseId: string;
  currentLecturerId: string | null;
  lecturers: Lecturer[];
};

export default function AssignLecturerForm({
  courseId,
  currentLecturerId,
  lecturers,
}: Props) {
  const [lecturerId, setLecturerId] = useState(currentLecturerId || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAssign = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/assign-lecturer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lecturerId: lecturerId || null }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={lecturerId}
        onChange={(e) => setLecturerId(e.target.value)}
        className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white max-w-[180px]"
      >
        <option value="">— Unassigned —</option>
        {lecturers.map((lecturer) => (
          <option key={lecturer.id} value={lecturer.id}>
            {lecturer.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading}
        className="px-3 py-1.5 bg-navy-700 text-white text-xs font-medium rounded-lg hover:bg-navy-800 disabled:opacity-60"
      >
        {loading ? "..." : "Save"}
      </button>
    </div>
  );
}