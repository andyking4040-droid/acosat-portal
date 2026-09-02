"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    setLoading(false);

    if (role === "student") {
      router.push("/student/dashboard");
    } else if (role === "lecturer") {
      router.push("/lecturer/dashboard");
    } else if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Tech background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-navy-900/80" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/acosat-logo.png"
              alt="ACOSAT Logo"
              className="w-28 h-28 object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ACOSAT  Edu-Portal
          </h1>
          <p className="text-navy-200 text-sm mt-1">
            American College of Science and Technology
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-8 pt-8 pb-2 text-center">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@acosat.edu"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-navy-700 hover:bg-navy-800 text-white font-semibold rounded-xl shadow-lg shadow-navy-700/25 transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-navy-200 text-xs mt-6">
          © {new Date().getFullYear()} American College of Science and
          Technology
        </p>
      </div>
    </div>
  );
}