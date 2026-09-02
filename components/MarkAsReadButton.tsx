"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkAsReadButton({
  notificationId,
}: {
  notificationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsRead = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/student/mark-notification-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
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
      onClick={handleMarkAsRead}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-medium text-navy-700 border border-navy-200 rounded-lg hover:bg-navy-50 disabled:opacity-60"
    >
      {loading ? "..." : "Mark as read"}
    </button>
  );
}