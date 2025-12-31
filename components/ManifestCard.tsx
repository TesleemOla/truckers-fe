import { Route } from "lucide-react";
import StatusPill from "./StatusPill";
import { Manifest } from "@/lib/api";
import CustomButton from "@/app/components/Button";
import Link from "next/link";

function ManifestsCard({ manifests }: { manifests: Manifest[] }) {
  const active = manifests.filter(
    (m) => m.status && m.status.toLowerCase() === "in-transit",
  );

  return (
    <section className="glass-card col-span-12 px-5 py-4 sm:px-6 sm:py-5 lg:col-span-7">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              Manifests
            </h2>
            <p className="text-[11px] text-slate-400">
              Current and recent routes
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-slate-50">
            {active.length}
          </p>
          <p className="text-[11px] text-slate-400">In transit</p>
        </div>
        <CustomButton title="View Manifests" className="ml-3 px-2 py-1 text-xs">
            <Link href="/manifests">View All</Link>
          </CustomButton>
      </div>

      <div className="mt-2 space-y-2">
        {manifests.slice(0, 5).map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3.5 py-2.5 text-xs"
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                { "Manifest"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {/* {m.origin} → {m.destination} */}
              </p>
              {m.driver && (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {/* Driver {m.driver.name} */}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusPill status={m.status} />
              {m.lastReportedLocation?.address && (
                <p className="text-[11px] text-slate-500">
                  {m.lastReportedLocation.address}
                </p>
              )}
            </div>
          </div>
        ))}

        {manifests.length === 0 && (
          <p className="py-4 text-center text-[11px] text-slate-500">
            No manifests yet. Create manifests via the API to see them here.
          </p>
        )}
      </div>
    </section>
  );
}

export default ManifestsCard;