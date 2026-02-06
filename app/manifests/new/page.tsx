"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, MapPin } from "lucide-react";
import { createManifest, getTrucks, getUsersByRole, Truck } from "@/lib/api";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useAuth } from "@/app/context/AuthContext";
import { isBackendError } from "@/lib/error";

export default function NewManifestPage() {
  const router = useRouter();
  const [manifestNumber, setManifestNumber] = useState("");
  const [allTrucks, setAllTrucks] = useState<Array<Truck>>([]);
  const [truck, setTruck] = useState("");
  const [driver, setDriver] = useState("");
  const [allDrivers, setAllDrivers] = useState<Array<{ _id: string; name: string; email: string; role: string }>>([]);
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
  const { user } = useAuth();

  // Check if user has permission to create manifests
  useEffect(() => {
    if (user && user.user.role !== "admin" && user.user.role !== "dispatcher") {
      toast.error("You don't have permission to create manifests. Only admins and dispatchers can perform this action.");
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    document.title = "New Manifest - Truckers App";
    getTrucks().then((data) => {
      setAllTrucks(data);
    }).catch((err) => {
      if (isBackendError(err)) {
        toast.error(err.message);
      }
    });

    getUsersByRole('driver').then((data) => {
      setAllDrivers(data);
    }).catch((err) => {
      if (isBackendError(err)) {
        toast.error(err.message);
      }
    });

    return () => {
      // Cleanup if needed
    }
  }, [])



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      toast.success("Manifest created successfully.");
      router.push(`/manifests`);
    } catch (err) {
      if (isBackendError(err)) {
        toast.error(err.message);
      }
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
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            New manifest
          </h2>
          <p className="text-xs text-slate-600">
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
            <label className="text-xs font-medium text-slate-700">
              Manifest number
            </label>
            <input
              required
              value={manifestNumber}
              onChange={(e) => setManifestNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Truck ID
            </label>
            <select
              required
              value={truck}
              onChange={(e) => setTruck(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select a truck</option>
              {allTrucks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.truckNumber} - {t.licensePlate}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Driver ID
            </label>
            <select
              required
              value={driver}
              onChange={(e) => setDriver(e.target.value)}

              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Select a driver</option>
              {allDrivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Cargo description
            </label>
            <input
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-800">Origin</p>
            <div className="space-y-1.5">
              <AddressAutocomplete
                label="Address"
                required
                value={origin.address}
                onChange={(val) => setOrigin(o => ({ ...o, address: val }))}
                onSelect={(data) => setOrigin(o => ({ ...o, address: data.address, latitude: data.lat, longitude: data.lon }))}
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">
                    Latitude
                  </label>
                  <input
                    required
                    value={origin.latitude}
                    onChange={(e) =>
                      setOrigin((o) => ({ ...o, latitude: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">
                    Longitude
                  </label>
                  <input
                    required
                    value={origin.longitude}
                    onChange={(e) =>
                      setOrigin((o) => ({ ...o, longitude: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-800">
              Destination
            </p>
            <div className="space-y-1.5">
              <AddressAutocomplete
                label="Address"
                required
                value={destination.address}
                onChange={(val) => setDestination(d => ({ ...d, address: val }))}
                onSelect={(data) => setDestination(d => ({ ...d, address: data.address, latitude: data.lat, longitude: data.lon }))}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700">
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700">
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

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
