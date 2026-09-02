"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  type: "lesson" | "quiz" | "assignment";
  label?: string;
};

export default function DeleteContentButton({ id, type, label }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete this ${type}? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch("/api/lecturer/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || `Failed to delete ${type}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-2.5 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
    >
      {loading ? "..." : label || "Delete"}
    </button>
  );
}