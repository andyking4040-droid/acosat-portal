"use client";

import { useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  students: Student[];
};

export default function GradeEntryForm({
  courseId,
  courseCode,
  courseTitle,
  students,
}: Props) {
  const [assessment, setAssessment] = useState("Midterm Exam");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleScoreChange = (studentId: string, value: string) => {
    setScores((prev) => ({ ...prev, [studentId]: value }));
  };

  const getLetterGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 85) return "A-";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "B-";
    if (score >= 65) return "C+";
    if (score >= 60) return "C";
    return "F";
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      for (const student of students) {
        const scoreValue = scores[student.id];
        if (scoreValue === undefined || scoreValue === "") continue;

        const score = Number(scoreValue);
        const letterGrade = getLetterGrade(score);

        await fetch("/api/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            courseId,
            assessment,
            score,
            letterGrade,
          }),
        });
      }

      setMessage("Grades saved successfully!");
    } catch (error) {
      setMessage("Failed to save some grades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-800">
            {courseCode} – {courseTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {students.length} students enrolled
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
          >
            <option>Midterm Exam</option>
            <option>Assignment 1</option>
            <option>Assignment 2</option>
            <option>Final Exam</option>
            <option>Overall Course Grade</option>
          </select>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-navy-700 text-white rounded-xl text-sm font-medium hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save All Grades"}
          </button>
        </div>
      </div>

      {message && (
        <div className="px-6 py-3 bg-emerald-50 text-emerald-700 text-sm">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left font-medium px-6 py-3">Student</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Score (/100)</th>
              <th className="text-left font-medium px-6 py-3">Letter Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const score = scores[student.id];
              const letter =
                score !== undefined && score !== ""
                  ? getLetterGrade(Number(score))
                  : "—";

              return (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{student.email}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={score || ""}
                      onChange={(e) =>
                        handleScoreChange(student.id, e.target.value)
                      }
                      placeholder="—"
                      className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-center focus:border-navy-500 outline-none"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        letter === "—"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {letter}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}