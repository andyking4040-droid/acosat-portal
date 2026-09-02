"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  email: string;
};

export default function SendNotificationForm({
  students,
}: {
  students: Student[];
}) {
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Failed to send notification");
      } else {
        setUserId("");
        setTitle("");
        setMessage("");
        setStatus("Notification sent successfully!");
        router.refresh();
      }
    } catch (error: any) {
      setStatus(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-semibold text-slate-800 mb-4">Send Notification</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Student
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. New Assignment Available"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            placeholder="Write the notification message..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
          {status && (
            <span
              className={`text-sm ${
                status.includes("success") ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {status}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}