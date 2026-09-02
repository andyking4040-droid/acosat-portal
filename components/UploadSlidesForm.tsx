"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  moduleId: string;
  currentSlidesUrl?: string | null;
  currentSlidesTitle?: string | null;
};

export default function UploadSlidesForm({
  moduleId,
  currentSlidesUrl,
  currentSlidesTitle,
}: Props) {
  const [slidesTitle, setSlidesTitle] = useState(currentSlidesTitle || "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("moduleId", moduleId);
      formData.append("slidesTitle", slidesTitle);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/lecturer/module-slides", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to upload slides");
      } else {
        setFile(null);
        setMessage("Slides uploaded successfully!");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const confirmed = confirm("Are you sure you want to remove these slides?");
    if (!confirmed) return;

    setRemoving(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/module-slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to remove slides");
      } else {
        setSlidesTitle("");
        setMessage("Slides removed successfully!");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="font-semibold text-slate-800 mb-1">
        Module Slides / PowerPoint
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Upload a PowerPoint or PDF file for students to download.
      </p>

      {/* Current slides */}
      {currentSlidesUrl && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
          <p className="text-sm font-medium text-slate-800 mb-1">
            Current: {currentSlidesTitle || "Untitled"}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={currentSlidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              Open / Download →
            </a>
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-60"
            >
              {removing ? "Removing..." : "Remove Slides"}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Slides Title
          </label>
          <input
            type="text"
            value={slidesTitle}
            onChange={(e) => setSlidesTitle(e.target.value)}
            placeholder="e.g. Week 1 – Introduction to Cells"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Upload File
          </label>
          <input
            type="file"
            accept=".ppt,.pptx,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-navy-50 file:text-navy-700 file:font-medium hover:file:bg-navy-100"
          />
          <p className="text-xs text-slate-500 mt-1">
            Accepted: .ppt, .pptx, .pdf
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload / Update Slides"}
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