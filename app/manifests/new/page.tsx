"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { createManifest } from "@/lib/api";

export default function NewManifestPage() {
  const router = useRouter();
  const [manifestNumber, setManifestNumber] = useState("");
  const [truck, setTruck] = useState("");
  const [driver, setDriver] = useState("");
  const [origin, setOrigin] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });
  const [destination, setDestination] = useState({
    address: "",
    latitude: "",
    longitude: "",
  });
  const [cargoDescription, setCargoDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const created = await createManifest({
        manifestNumber,
        truck,
        driver,
        origin: {
          address: origin.address,
          latitude: Number(origin.latitude),
          longitude: Number(origin.longitude),
        },
        destination: {
          address: destination.address,
          latitude: Number(destination.latitude),
          longitude: Number(destination.longitude),
        },
        cargoDescription: cargoDescription || undefined,
        notes: notes || undefined,
      });
      router.push(`/manifests/${created._id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create manifest.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">
            New manifest
          </h2>
          <p className="text-xs text-slate-400">
            Create a new route with origin, destination, and cargo details.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card space-y-4 px-6 py-5 sm:px-7 sm:py-6"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-300">
              Manifest number
            </label>
            <input
              required
              value={manifestNumber}
              onChange={(e) => setManifestNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Truck ID
            </label>
            <input
              required
              value={truck}
              onChange={(e) => setTruck(e.target.value)}
              placeholder="Mongo ObjectId"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Driver ID
            </label>
            <input
              required
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              placeholder="Mongo ObjectId"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Cargo description
            </label>
            <input
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-200">Origin</p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">
                Address
              </label>
              <input
                required
                value={origin.address}
                onChange={(e) =>
                  setOrigin((o) => ({ ...o, address: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300">
                  Latitude
                </label>
                <input
                  required
                  value={origin.latitude}
                  onChange={(e) =>
                    setOrigin((o) => ({ ...o, latitude: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300">
                  Longitude
                </label>
                <input
                  required
                  value={origin.longitude}
                  onChange={(e) =>
                    setOrigin((o) => ({ ...o, longitude: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-200">
              Destination
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">
                Address
              </label>
              <input
                required
                value={destination.address}
                onChange={(e) =>
                  setDestination((d) => ({ ...d, address: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300">
                  Latitude
                </label>
                <input
                  required
                  value={destination.latitude}
                  onChange={(e) =>
                    setDestination((d) => ({
                      ...d,
                      latitude: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-300">
                  Longitude
                </label>
                <input
                  required
                  value={destination.longitude}
                  onChange={(e) =>
                    setDestination((d) => ({
                      ...d,
                      longitude: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost rounded-full px-3 py-1.5 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create manifest"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


