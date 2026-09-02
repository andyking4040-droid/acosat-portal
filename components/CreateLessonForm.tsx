"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLessonForm({ moduleId }: { moduleId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, title, content, videoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create lesson");
      } else {
        setTitle("");
        setContent("");
        setVideoUrl("");
        setMessage("Lesson created successfully!");
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
      <h2 className="font-semibold text-slate-800 mb-4">Create New Lesson</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Lesson Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Introduction to Human Anatomy"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Content (optional)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="Write the lesson content here..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Video URL (optional)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Lesson"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes("success")
                  ? "text-emerald-600"
                  : "text-red-600"
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