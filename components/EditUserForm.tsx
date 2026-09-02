"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function EditUserForm({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name,
          email,
          password: password || undefined,
        }),
      });

      // Safer JSON parsing
      const text = await res.text();
      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setMessage("Server returned invalid response");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setMessage(data.error || "Failed to update user");
      } else {
        setMessage("User updated successfully!");
        setPassword("");
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setMessage("");
        }, 1000);
      }
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Edit User
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password (optional)
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-navy-700 text-white text-sm font-medium rounded-xl hover:bg-navy-800 disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
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