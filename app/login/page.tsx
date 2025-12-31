"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
      await login(email, password);

  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="glass-card px-6 py-6 sm:px-8 sm:py-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-50">
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Sign in to access your fleet dashboard.
            </p>
          </div>
          <div className="hidden text-xs text-slate-400 sm:block">
            <span className="rounded-full bg-slate-800/90 px-3 py-1">
              Fleet control · Live visibility
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-primary-500/0 transition focus:border-primary-500/70 focus:ring-2 focus:ring-primary-500/50"
              placeholder="dispatcher@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-primary-500/0 transition focus:border-primary-500/70 focus:ring-2 focus:ring-primary-500/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-1 w-full justify-center gap-2 rounded-xl py-2.5 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-500">
        Need an account?{" "}
        <button
          type="button"
          className="font-medium text-primary-300 hover:text-primary-200"
          onClick={() => router.push("/register")}
        >
          Create one
        </button>
      </p>
    </div>
  );
}


