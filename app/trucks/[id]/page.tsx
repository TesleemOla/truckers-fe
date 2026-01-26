"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2, MapPin, Trash2, Truck } from "lucide-react";
import {
  deleteTruck,
  getTruck,
  type Truck as TruckType,
  updateTruck,
  updateTruckLocation,
} from "@/lib/api";
import { TruckLocationMap } from "@/components/maps/TruckLocationMap";

export default function TruckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [truck, setTruck] = useState<TruckType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    truckNumber: "",
    licensePlate: "",
    make: "",
    model: "",
    year: "",
    status: "",
  });

  const [locationForm, setLocationForm] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getTruck(id);
        setTruck(data);
        setForm({
          truckNumber: data.truckNumber,
          licensePlate: data.licensePlate,
          make: data.make ?? "",
          model: data.model ?? "",
          year: data.year?.toString() ?? "",
          status: data.status ?? "available",
        });
        setLocationForm({
          latitude: data.currentLocation?.latitude?.toString() ?? "",
          longitude: data.currentLocation?.longitude?.toString() ?? "",
          address: data.currentLocation?.address ?? "",
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load truck.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!truck) return;
    setSaving(true);
    try {
      const updated = await updateTruck(truck._id, {
        truckNumber: form.truckNumber,
        licensePlate: form.licensePlate,
        make: form.make || undefined,
        model: form.model || undefined,
        year: form.year ? Number(form.year) : undefined,
        status: form.status,
      });
      setTruck(updated);
      toast.success("Truck details saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!truck) return;
    setLocationSaving(true);
    try {
      const updated = await updateTruckLocation(truck._id, {
        latitude: Number(locationForm.latitude),
        longitude: Number(locationForm.longitude),
        address: locationForm.address || undefined,
      });
      setTruck(updated);
      toast.success("Truck location updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update location.");
    } finally {
      setLocationSaving(false);
    }
  }

  async function handleDelete() {
    if (!truck) return;
    setSaving(true);
    try {
      await deleteTruck(truck._id);
      toast.success("Truck deleted successfully.");
      router.push("/trucks");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete truck.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading truck...
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="flex items-center gap-2 text-xs text-rose-300">
        <AlertTriangle className="h-4 w-4" />
        Truck not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-300">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
              {truck.truckNumber}
            </h2>
            <p className="text-xs text-slate-400">
              Plate {truck.licensePlate} ·{" "}
              <span className="text-slate-200">
                {truck.status ?? "available"}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="bg-red-600 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-100 hover:bg-red-500/10 hover:text-red-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form
          onSubmit={handleSave}
          className="glass-card space-y-4 px-5 py-4 sm:px-6 sm:py-5"
        >
          <h3 className="text-sm font-semibold text-slate-100">
            Vehicle details
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Truck number
              </label>
              <input
                required
                value={form.truckNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, truckNumber: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                License plate
              </label>
              <input
                required
                value={form.licensePlate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, licensePlate: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Make
              </label>
              <input
                value={form.make}
                onChange={(e) =>
                  setForm((f) => ({ ...f, make: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Model
              </label>
              <input
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="available">Available</option>
              <option value="in-transit">In transit</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>

        <div className="glass-card space-y-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Location
                </h3>
                <p className="text-[11px] text-slate-400">
                  Update GPS coordinates and view on the map.
                </p>
              </div>
            </div>
          </div>

          {/* <TruckLocationMap location={truck.currentLocation} /> */}

          <form
            onSubmit={handleSaveLocation}
            className="mt-3 grid gap-3 sm:grid-cols-3"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Latitude
              </label>
              <input
                required
                value={locationForm.latitude}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, latitude: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Longitude
              </label>
              <input
                required
                value={locationForm.longitude}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, longitude: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Address (optional)
              </label>
              <input
                value={locationForm.address}
                onChange={(e) =>
                  setLocationForm((f) => ({ ...f, address: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                disabled={locationSaving}
                className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs"
              >
                {locationSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating location...
                  </>
                ) : (
                  "Update location"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-100">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Delete this truck?
            </div>
            <p className="mb-4 text-xs text-slate-400">
              This action cannot be undone. Any manifests referencing this truck
              may fail to load correctly.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="btn-ghost rounded-full px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 font-medium text-white shadow hover:bg-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
