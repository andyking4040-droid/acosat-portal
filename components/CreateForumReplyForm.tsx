"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateForumReplyForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to post reply");
      } else {
        setContent("");
        setMessage("Reply posted!");
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
      <h2 className="font-semibold text-slate-800 mb-4">Write a Reply</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          placeholder="Write your reply..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post Reply"}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes("!") ? "text-emerald-600" : "text-red-600"
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