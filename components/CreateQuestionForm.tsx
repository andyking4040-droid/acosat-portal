"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateQuestionForm({ quizId }: { quizId: string }) {
  const [text, setText] = useState("");
  const [type, setType] = useState<"multiple_choice" | "short_answer">("multiple_choice");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
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

    if (type === "multiple_choice") {
      const validOptions = options.filter((o) => o.text.trim() !== "");

      if (validOptions.length < 2) {
        setMessage("Please provide at least 2 options");
        setLoading(false);
        return;
      }

      if (!validOptions.some((o) => o.isCorrect)) {
        setMessage("Please mark one option as correct");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/lecturer/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          text,
          type,
          options: type === "multiple_choice" ? options.filter((o) => o.text.trim() !== "") : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create question");
      } else {
        setText("");
        setType("multiple_choice");
        setOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ]);
        setMessage("Question added successfully!");
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
      <h2 className="font-semibold text-slate-800 mb-4">Add New Question</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Question Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "multiple_choice" | "short_answer")}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="short_answer">Short Answer (SAQ)</option>
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Question
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={2}
            placeholder="Enter the question..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
          />
        </div>

        {/* Options - only for Multiple Choice */}
        {type === "multiple_choice" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Options (mark the correct one)
            </label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correct"
                  checked={option.isCorrect}
                  onChange={() => updateOption(index, "isCorrect", true)}
                  className="w-4 h-4"
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(index, "text", e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-navy-500 outline-none text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {type === "short_answer" && (
          <p className="text-sm text-slate-500">
            Students will type their answer. You will grade it manually later.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Question"}
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