"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FileText, Plus } from "lucide-react";
import { getManifests, type Manifest } from "@/lib/api";

export default function ManifestsPage() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await getManifests();
        setManifests(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load manifests.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
              Manifests
            </h2>
            <p className="text-xs text-slate-400">
              Route-level detail for every load.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/manifests/new")}
          className="btn-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New manifest
        </button>
      </div>

      <div className="glass-card divide-y divide-slate-800/80">
        <div className="grid grid-cols-3 gap-2 px-5 py-3 text-[11px] text-slate-400 sm:px-6">
          <span>Manifest</span>
          <span className="hidden text-center sm:block">Route</span>
          <span className="text-right">Status</span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-5 py-6 text-xs text-slate-300 sm:px-6">
            <Activity className="h-4 w-4 animate-spin" />
            Loading manifests...
          </div>
        )}

        {error && (
          <div className="px-5 py-4 text-xs text-rose-400 sm:px-6">{error}</div>
        )}

        {!loading && !error && manifests.length === 0 && (
          <div className="px-5 py-6 text-xs text-slate-400 sm:px-6">
            No manifests yet. Use the API or &quot;New manifest&quot; to create
            one.
          </div>
        )}

        {!loading &&
          !error &&
          manifests.map((m) => (
            <button
              key={m._id}
              className="grid w-full grid-cols-3 gap-2 px-5 py-3 text-left text-xs hover:bg-slate-900/70 sm:px-6"
              onClick={() => router.push(`/manifests/${m._id}`)}
            >
              <div>
                <p className="font-medium text-slate-100">
                  {m.manifestNumber}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Truck{" "}
                  {typeof m.truck === "string"
                    ? m.truck
                    : m.truck.truckNumber ?? "N/A"}
                </p>
              </div>
              <div className="hidden text-center text-[11px] text-slate-400 sm:block">
                {m.origin.address} → {m.destination.address}
              </div>
              <div className="text-right text-[11px] text-slate-300">
                {m.status}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}


