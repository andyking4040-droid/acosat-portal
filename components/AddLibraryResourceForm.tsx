"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLibraryResourceForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fileUrl, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to add resource");
      } else {
        setTitle("");
        setDescription("");
        setFileUrl("");
        setCategory("General");
        setMessage("Resource added successfully!");
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
      <h2 className="font-semibold text-slate-800 mb-4">Add Library Resource</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Introduction to Anatomy PDF"
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
            placeholder="Short description of the resource"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            File URL
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            Paste a link to the PDF, document, or video
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="General">General</option>
            <option value="Health Science">Health Science</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Business Management">Business Management</option>
            <option value="Research Papers">Research Papers</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Resource"}
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