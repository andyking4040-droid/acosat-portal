"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${userName}"?\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete user");
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
      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}