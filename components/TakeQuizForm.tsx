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
  type: string;
  points: number;
  options: Option[];
};

type Props = {
  quizId: string;
  courseId: string;
  questions: Question[];
  timeLimit: number | null;
};

export default function TakeQuizForm({
  quizId,
  courseId,
  questions,
  timeLimit,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    message: string;
  } | null>(null);
  const router = useRouter();

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit the quiz?")) return;

    setLoading(true);

    try {
      const res = await fetch("/api/student/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId,
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit quiz");
      } else {
        setResult({
          score: data.score,
          maxScore: data.maxScore,
          message: data.message,
        });
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
        <p className="text-slate-600 mb-1">{result.message}</p>
        <p className="text-4xl font-bold text-navy-700 my-4">
          {result.score} / {result.maxScore}
        </p>
        <button
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="px-6 py-2.5 bg-navy-700 text-white rounded-xl text-sm font-medium hover:bg-navy-800"
        >
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeLimit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
          Time limit: {timeLimit} minutes. Make sure you submit before time runs out.
        </div>
      )}

      {questions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <p className="font-medium text-slate-800 mb-1">
            {index + 1}. {question.text}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            {question.type === "short_answer" ? "Short Answer" : "Multiple Choice"} ·{" "}
            {question.points} point{question.points > 1 ? "s" : ""}
          </p>

          {question.type === "multiple_choice" ? (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    answers[question.id] === option.id
                      ? "border-navy-500 bg-navy-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() => handleAnswer(question.id, option.id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">{option.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={3}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-navy-500 outline-none text-sm"
            />
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading || questions.length === 0}
          className="px-8 py-3 bg-navy-700 text-white font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}