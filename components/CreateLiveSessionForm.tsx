"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLiveSessionForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          description,
          meetingUrl,
          scheduledAt,
          duration: Number(duration),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create live session");
      } else {
        setTitle("");
        setDescription("");
        setMeetingUrl("");
        setScheduledAt("");
        setDuration("60");
        setMessage("Live session created successfully!");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-semibold text-slate-800 mb-4">Schedule Live Class</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Live Lecture – Introduction to Cells"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What will be covered in this session..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Meeting Link (Google Meet / Jitsi / Zoom)
          </label>
          <input
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            required
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={15}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Schedule Live Class"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes("success") ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}