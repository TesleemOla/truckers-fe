"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Activity, Plus, Truck } from "lucide-react";
import { getTrucks, type Truck as TruckType } from "@/lib/api";

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await getTrucks();
        setTrucks(data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load trucks."
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
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-900">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
              Trucks
            </h2>
            <p className="text-xs text-slate-800">
              Manage every vehicle in your fleet.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/trucks/new")}
          className="btn-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          New truck
        </button>
      </div>

      <div className="glass-card divide-y divide-slate-800/80">
        <div className="flex items-center justify-between px-5 py-3 text-[11px] text-slate-400 sm:px-6">
          <span>Truck</span>
          <span className="hidden sm:block">Driver</span>
          <span>Status</span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 px-5 py-6 text-xs text-slate-300 sm:px-6">
            <Activity className="h-4 w-4 animate-spin" />
            Loading trucks...
          </div>
        )}

        {!loading && trucks.length === 0 && (
          <div className="px-5 py-6 text-xs text-slate-400 sm:px-6">
            No trucks yet. Use the API or &quot;New truck&quot; to create one.
          </div>
        )}

        {!loading &&
          trucks.map((truck) => (
            <button
              key={truck._id}
              className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-xs hover:bg-blue-400/70 sm:px-6"
              onClick={() => router.push(`/trucks/${truck._id}`)}
            >
              <div>
                <p className="font-medium text-slate-900">
                  {truck.truckNumber}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-900">
                  Plate {truck.licensePlate}
                </p>
              </div>
              <div className="hidden text-[11px] text-slate-900 sm:block">
                {truck.assignedDriver
                  ? truck.assignedDriver.name
                  : "Unassigned"}
              </div>
              <div className="text-right text-[11px] text-slate-900">
                {truck.status ?? "available"}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
