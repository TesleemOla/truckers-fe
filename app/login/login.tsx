"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { isBackendError } from "@/lib/error";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the redirect URL from query parameters
  const redirectTo = searchParams.get('redirect') || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Redirect to the intended page or dashboard
      router.push(redirectTo as any);
    } catch (err) {
      if (isBackendError(err)) {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (

    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="glass-card px-6 py-6 sm:px-8 sm:py-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Sign in to access your fleet dashboard.
            </p>
          </div>
          <div className="hidden text-xs text-slate-600 sm:block">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              Fleet control · Live visibility
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-primary-500/0 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="dispatcher@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-primary-500/0 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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

      <p className="text-center text-xs text-slate-600">
        Need an account?{" "}
        <button
          type="button"
          className="font-medium text-primary-600 hover:text-primary-700"
          onClick={() => router.push("/register")}
        >
          Create one
        </button>
      </p>
    </div>
  );
}


