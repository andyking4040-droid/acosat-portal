"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create user");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setRole("student");
        setMessage("Account created successfully!");
        router.refresh();

        // Close popup after short delay
        setTimeout(() => {
          setOpen(false);
          setMessage("");
        }, 1200);
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button to open popup */}
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800"
      >
        + Create Account
      </button>

      {/* Popup Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Modal box */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Create New Account
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Andy King"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. andy@acosat.edu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="e.g. Welcome123"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              {message && (
                <p
                  className={`text-sm ${
                    message.includes("success")
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}