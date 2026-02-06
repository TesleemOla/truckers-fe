"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { registerUser } from "@/lib/api";
import { isBackendError } from "@/lib/error";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"manager" | "driver">("manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerUser({ name, email, password, role });
      router.push("/");
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
              Create an account
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Set up access for dispatchers or drivers.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Full name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-primary-500/0 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              placeholder="Jane Dispatcher"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${role === "manager"
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
              >
                Dispatcher / Manager
              </button>
              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${role === "driver"
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
              >
                Driver
              </button>
            </div>
          </div>

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
              placeholder="you@company.com"
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
              placeholder="At least 8 characters"
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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-600">
        Already have an account?{" "}
        <button
          type="button"
          className="font-medium text-primary-600 hover:text-primary-700"
          onClick={() => router.push("/login")}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}


