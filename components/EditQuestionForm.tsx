"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  text: string;
  options: Option[];
};

export default function EditQuestionForm({ question }: { question: Question }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState(
    question.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const updateOption = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean
  ) => {
    const newOptions = [...options];
    if (field === "text") {
      newOptions[index].text = value as string;
    } else {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    }
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/lecturer/questions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          text,
          options,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update question");
      } else {
        setMessage("Question updated!");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-navy-600 hover:text-navy-800 font-medium"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
        />

        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id || index} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={option.isCorrect}
                onChange={() => updateOption(index, "isCorrect", true)}
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(index, "text", e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 bg-navy-700 text-white text-xs rounded-lg hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 border border-slate-200 text-xs rounded-lg"
          >
            Cancel
          </button>
        </div>

        {message && <p className="text-xs text-emerald-600">{message}</p>}
      </form>
    </div>
  );
}