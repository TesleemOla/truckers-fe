import {
  type AuthUser,
  type Truck,
  type Manifest,
} from "@/lib/api";
import { LogOut, Truck as TruckTag, Route, Activity } from "lucide-react";
import ManifestsCard from "@/components/ManifestCard";
import TrucksCard from "@/components/TrucksCard";
import { serverApiFetch } from "@/lib/server-api";

async function loadData() {
  // Middleware ensures user is authenticated, so we can safely fetch data
  const [user, trucks, manifests] = await Promise.all([
    serverApiFetch<AuthUser>("/auth/profile"),
    serverApiFetch<Truck[]>("/trucks"),
    serverApiFetch<Manifest[]>("/manifests"),
  ]);

  return { user, trucks, manifests };
}

export default async function DashboardPage() {
  const { user, trucks, manifests } = await loadData();

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
            . Monitor trucks, manifests, and drivers in one place.
          </p>
        </div>
        <form
          action="/api/logout"
          method="post"
          className="flex justify-end"
        >
          <button
            type="submit"
            className="btn-ghost inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-5">
        <section className="glass-card col-span-12 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80 text-primary-300 shadow-soft ring-1 ring-slate-800">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300">
                Operations snapshot
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {trucks.length} trucks · {manifests.length} manifests in
                view
              </p>
            </div>
          </div>
        </section>

        <TrucksCard trucks={trucks || []} />
        <ManifestsCard manifests={manifests || []} />
      </div>
    </div>
  );
}


