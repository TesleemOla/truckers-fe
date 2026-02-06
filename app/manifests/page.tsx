"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { getManifests, type Manifest } from "@/lib/api";
import Loading from "../components/Loading";
import { useAuth } from "@/app/context/AuthContext";
import { isBackendError } from "@/lib/error";
import { toast } from "sonner";

export default function ManifestsPage() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await getManifests();
        setManifests(data);
      } catch (err) {
        if (isBackendError(err)) {
          toast.error(err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  console.log(manifests)
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
            <p className="text-xs text-slate-900">
              Route-level detail for every load.
            </p>
          </div>
        </div>
        {user && (user.user.role === "admin" || user.user.role === "dispatcher") && (
          <button
            onClick={() => router.push("/manifests/new")}
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New manifest
          </button>
        )}
      </div>

      <div className="glass-card divide-y divide-slate-800/80">
        <div className="grid grid-cols-3 gap-2 px-5 py-3 text-3em text-slate-900 sm:px-6">
          <span>Truck</span>
          <span className="hidden text-center sm:block">Route</span>
          <span className="text-right">Status</span>
        </div>

        {loading && (
          <Loading />
        )}

        {error && (
          <div className="px-5 py-4 text-xs text-rose-400 sm:px-6">{error}</div>
        )}

        {!loading && !error && manifests.length === 0 && (
          <div className="px-5 py-6 text-xs text-slate-900 sm:px-6">
            No manifests yet. Use the API or &quot;New manifest&quot; to create
            one.
          </div>
        )}

        {!loading &&
          !error &&
          manifests.map((m) => (
            manifests.map((m) => (
              <div
                key={m._id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push(`/manifests/${m._id}`);
                  }
                }}
                className="grid w-full cursor-pointer grid-cols-3 gap-2 px-5 py-3 text-left text-xs hover:bg-slate-200/70 sm:px-6"
                onClick={() => router.push(`/manifests/${m._id}`)}
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {m.manifestNumber}
                  </p>
                  <p className="mt-0.5 text-3em text-slate-900">
                    Truck{" "}
                    {typeof m.truck === "string"
                      ? m.truck
                      : m.truck.truckNumber ?? "N/A"}
                  </p>
                </div>
                <div className="hidden text-center text-3em text-slate-900 sm:block">
                  From: {m.origin.address} <br />
                  To: {m.destination.address}
                </div>
                <div className="text-right text-3em text-slate-900">
                  {m.status}
                </div>
              </div>
            )))
          )}
      </div>
    </div>
  );
}


