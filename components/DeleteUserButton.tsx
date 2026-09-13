"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete ${userName || "this user"}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        alert("Server error — invalid response");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to delete user");
        return;
      }

      router.refresh();
    } catch (error: any) {
      alert(error?.message || "Something went wrong");
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