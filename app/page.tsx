"use client"
import { LogOut, Truck as TruckTag, Route, Activity } from "lucide-react";
import DriverDashboard from "@/components/DriverDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import LoadingTruck from "./components/LoadingTruck";
import { useAuth } from "./context/AuthContext";


export default function LandingPage() {
  const { user } = useAuth()

  // If no user is authenticated, show a beautiful landing page
  console.log(user)
  if (!user) {
    return (
      <div className="relative flex flex-col items-center justify-center py-12 text-center min-h-[80vh]">
        {/* Responsive Background Image filling the entire screen width */}
        <div className="absolute left-1/2 top-0 -z-10 h-full w-screen -translate-x-1/2 overflow-hidden pointer-events-none">
          <img
            src="/trucker.jpg"
            alt="Trucker background"
            className="h-full w-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/60 to-white" />
        </div>

        <div className="relative mb-8 h-20 w-20">
          <LoadingTruck />
        </div>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Complete Visibility for your <span className="text-primary-600">Fleet Operations</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-slate-600">
          Track trucks, manage manifests, and monitor driver updates in real-time with an advanced logistics dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 sm:w-auto"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 sm:w-auto"
          >
            Create an account
          </a>
        </div>

        <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center p-4">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900">Live Tracking</h3>
            <p className="mt-2 text-sm text-slate-500">Real-time GPS updates for every truck on the road.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Route className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900">Manifest Mgmt</h3>
            <p className="mt-2 text-sm text-slate-500">Easily create and assign manifests to your drivers.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <TruckTag className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-900">Fleet Insights</h3>
            <p className="mt-2 text-sm text-slate-500">Detailed logs and status reports for your entire fleet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary-600">
            Overview
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Good day, {user?.user?.name}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            You&apos;re signed in as{" "}
            <span className="font-medium text-slate-800">
              {user?.user?.role}
            </span>
            {user?.user?.role === "admin" ?
              ".  " + "Monitor trucks, manifests, and drivers in one place." :
              ".  " + "Your location details and Manifest details are updated in real-time."}
          </p>
        </div>
        <form
          action="/api/logout"
          method="post"
          className="flex justify-end"
        >
          <button
            type="submit"
            className="p-4 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-red-600 text-white text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>
      {
        user?.user?.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <DriverDashboard user={user} />
        )
      }

    </div>
  );
}
