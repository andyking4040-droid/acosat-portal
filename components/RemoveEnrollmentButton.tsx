"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveEnrollmentButton({
  enrollmentId,
}: {
  enrollmentId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this student from the course?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/remove-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
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
    <button
      onClick={handleRemove}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}