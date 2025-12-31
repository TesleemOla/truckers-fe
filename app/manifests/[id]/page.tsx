"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  FileText,
  Loader2,
  MapPin,
  PlayCircle,
  StopCircle,
  Trash2,
  Truck,
} from "lucide-react";
import {
  deleteManifest,
  getManifest,
  recordArrival,
  recordDeparture,
  type Manifest as ManifestType,
  updateManifest,
  updateManifestLocation,
} from "@/lib/api";
import { ManifestRouteMap } from "@/components/maps/ManifestRouteMap";

export default function ManifestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [manifest, setManifest] = useState<ManifestType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    manifestNumber: "",
    truck: "",
    driver: "",
    status: "",
    cargoDescription: "",
    notes: "",
  });

  const [locationForm, setLocationForm] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getManifest(id);
        setManifest(data);
        setForm({
          manifestNumber: data.manifestNumber,
          truck:
            typeof data.truck === "string"
              ? data.truck
              : (data.truck as any)._id ?? "",
          driver:
            typeof data.driver === "string"
              ? data.driver
              : (data.driver as any)._id ?? "",
          status: data.status,
          cargoDescription: data.cargoDescription ?? "",
          notes: data.notes ?? "",
        });
        setLocationForm({
          latitude: data.lastReportedLocation?.latitude?.toString() ?? "",
          longitude: data.lastReportedLocation?.longitude?.toString() ?? "",
          address: data.lastReportedLocation?.address ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load manifest.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!manifest) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateManifest(manifest._id, {
        manifestNumber: form.manifestNumber,
        truck: form.truck,
        driver: form.driver,
        status: form.status,
        cargoDescription: form.cargoDescription || undefined,
        notes: form.notes || undefined,
      });
      setManifest(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!manifest) return;
    setLocationSaving(true);
    setError(null);
    try {
      const updated = await updateManifestLocation(manifest._id, {
        latitude: Number(locationForm.latitude),
        longitude: Number(locationForm.longitude),
        address: locationForm.address || undefined,
      });
      setManifest(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update location.",
      );
    } finally {
      setLocationSaving(false);
    }
  }

  async function handleDeparture() {
    if (!manifest) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await recordDeparture(manifest._id);
      setManifest(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record departure.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleArrival() {
    if (!manifest) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await recordArrival(manifest._id);
      setManifest(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record arrival.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!manifest) return;
    setSaving(true);
    setError(null);
    try {
      await deleteManifest(manifest._id);
      router.push("/manifests");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete manifest.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading manifest...
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="flex items-center gap-2 text-xs text-rose-300">
        <AlertTriangle className="h-4 w-4" />
        Manifest not found.
      </div>
    );
  }

  const truckDisplay =
    typeof manifest.truck === "string"
      ? manifest.truck
      : `${(manifest.truck as any).truckNumber} · ${
          (manifest.truck as any).licensePlate ?? ""
        }`;

  const driverDisplay =
    typeof manifest.driver === "string"
      ? manifest.driver
      : `${(manifest.driver as any).name} · ${
          (manifest.driver as any).email ?? ""
        }`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
              Manifest {manifest.manifestNumber}
            </h2>
            <p className="text-xs text-slate-400">
              {manifest.origin.address} → {manifest.destination.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-200">
            {manifest.status}
          </span>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="btn-ghost inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-2 text-xs text-rose-200">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="glass-card space-y-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary-500/10 text-primary-300">
                <Truck className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Assignment
                </h3>
                <p className="text-[11px] text-slate-400">
                  Truck and driver for this route.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Manifest number
                </label>
                <input
                  required
                  value={form.manifestNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, manifestNumber: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="pending">Pending</option>
                  <option value="in-transit">In transit</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Truck ID
                </label>
                <input
                  required
                  value={form.truck}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, truck: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
                <p className="text-[11px] text-slate-500">{truckDisplay}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Driver ID
                </label>
                <input
                  required
                  value={form.driver}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, driver: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
                />
                <p className="text-[11px] text-slate-500">{driverDisplay}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Cargo description
              </label>
              <input
                value={form.cargoDescription}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cargoDescription: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <div>
                  <p>
                    Departure:{" "}
                    <span className="text-slate-200">
                      {manifest.departureTime
                        ? new Date(
                            manifest.departureTime,
                          ).toLocaleString()
                        : "Not recorded"}
                    </span>
                  </p>
                  <p>
                    Arrival:{" "}
                    <span className="text-slate-200">
                      {manifest.arrivalTime
                        ? new Date(manifest.arrivalTime).toLocaleString()
                        : "Not recorded"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDeparture}
                  disabled={saving}
                  className="btn-ghost inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 px-3 py-1.5 text-emerald-200 hover:bg-emerald-500/10"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  Departure
                </button>
                <button
                  type="button"
                  onClick={handleArrival}
                  disabled={saving}
                  className="btn-ghost inline-flex items-center gap-1.5 rounded-full border border-primary-500/60 px-3 py-1.5 text-primary-200 hover:bg-primary-500/10"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                  Arrival
                </button>
              </div>
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
        </div>

        <div className="glass-card space-y-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Route &amp; live position
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visualize origin, destination, and last reported location.
                </p>
              </div>
            </div>
          </div>

          <ManifestRouteMap
            origin={manifest.origin}
            destination={manifest.destination}
            lastReportedLocation={manifest.lastReportedLocation}
          />

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
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
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
              Delete this manifest?
            </div>
            <p className="mb-4 text-xs text-slate-400">
              This action cannot be undone. Location history and timestamps will
              be lost.
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


