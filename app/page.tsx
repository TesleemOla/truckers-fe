import { LogOut, Truck as TruckTag, Route, Activity } from "lucide-react";
import ServerAuth from "./context/ServerSideUser";
import DriverDashboard from "@/components/DriverDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";


export default async function DashboardPage() {
  const { user, trucks } = await ServerAuth()

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
          <DriverDashboard user={user} trucks={trucks} />
        )
      }

    </div>
  );
}
