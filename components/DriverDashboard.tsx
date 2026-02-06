"use client";

import React, { useEffect, useState } from "react";
import {
  AuthUser,
  Truck,
  Manifest,
  updateTruckLocation,
  updateManifestLocation,
  recordDeparture,
  recordArrival,
  apiFetch,
  getManifests
} from "@/lib/api";
import { MapPin, Navigation, Truck as TruckIcon, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { ManifestRouteMap } from "./maps/ManifestRouteMap";
import { isBackendError } from "@/lib/error";


interface DriverDashboardProps {
  user: AuthUser;
  trucks: Truck[];

}

export default function DriverDashboard({ user, trucks }: DriverDashboardProps) {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [activeManifest, setActiveManifest] = useState<Manifest | undefined>()
  const [myTruck, setMyTruck] = useState<Truck | undefined>()

  useEffect(() => {
    async function fetchManifests() {
      try {
        const data = await getManifests()
        console.log(data)
        setManifests(data);
      } catch (error) {
        if (isBackendError(error)) {
          toast.error(error.message);
        }
        setManifests([]);
      }
    }
    fetchManifests();
  }, []);

  useEffect(() => {
    const currentManifest = manifests.find((m) => m.status === "in-transit");
    setActiveManifest(currentManifest);
    const currentTruck = trucks.find((t) => t.assignedDriver?._id === user.user._id);
    setMyTruck(currentTruck);
  }, [manifests])

  console.log(activeManifest)
  const [loading, setLoading] = useState(false);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {

          await updateTruckLocation(user.user.truck._id, { latitude, longitude });
          if (!activeManifest) return;
          await updateManifestLocation(activeManifest?._id, { latitude, longitude });


          toast.success("Location updated successfully");
          // Ideally we would refresh data here, but for now relies on page reload or optimistic updates (not implemented for simplicity)
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to update location";
          toast.error(message);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  const handleStatusChange = async (action: 'start' | 'complete') => {
    if (!activeManifest) return;
    setLoading(true);
    try {
      if (action === 'start') {
        await recordDeparture(activeManifest._id);
        toast.success("Route started! Drive safely.");
      } else {
        await recordArrival(activeManifest._id);
        toast.success("Route completed! Great job.");
      }
      // Trigger a page refresh to update server-side data
      window.location.reload();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to ${action} route`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!activeManifest) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <TruckIcon className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No Assignments found</h3>
        <p className="mt-2 text-sm text-slate-500">You currently don't have an active truck or manifest assigned.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">


      {/* active Route Card */}
      <div className="md:col-span-2 space-y-6">
        {activeManifest ? (
          <div className="glass-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Current Manifest</h3>
                  <p className="text-xs text-slate-500">#{activeManifest.manifestNumber}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${activeManifest.status === 'In Transit'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-800'
                  }`}>
                  {activeManifest.status}
                </span>
              </div>
            </div>

            <div className="p-0">
              <ManifestRouteMap
                origin={activeManifest.origin}
                destination={activeManifest.destination}
                lastReportedLocation={activeManifest.lastReportedLocation}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Origin</p>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full border border-blue-500 bg-blue-50 p-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">{activeManifest.origin.address}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</p>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full border border-emerald-500 bg-emerald-50 p-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">{activeManifest.destination.address}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end gap-3">
              {activeManifest.status === 'Scheduled' || activeManifest.status === 'Pending' ? (
                <button
                  onClick={() => handleStatusChange('start')}
                  disabled={loading}
                  className="btn-primary"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Start Route
                </button>
              ) : activeManifest.status === 'In Transit' ? (
                <button
                  onClick={() => handleStatusChange('complete')}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 transition"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Route
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="glass-card flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <Clock className="h-10 w-10 text-slate-300 mb-3" />
            <p>No active manifests scheduled.</p>
          </div>
        )}
      </div>

      {/* Location & Truck Status */}
      <div className="space-y-6">
        {myTruck && (
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                <TruckIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Assigned Vehicle</p>
                <h3 className="font-bold text-slate-900">{myTruck.truckNumber}</h3>
                <p className="text-xs text-slate-400">{myTruck.make} {myTruck.model}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary-500" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Last Reported Location</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {myTruck.currentLocation?.address || "No location data available"}
                  </p>
                  {myTruck.currentLocation?.lastUpdated && (
                    <p className="mt-1 text-[10px] text-slate-400" suppressHydrationWarning>
                      Updated: {new Date(myTruck.currentLocation.lastUpdated).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleUpdateLocation}
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? 'Updating...' : 'Update My Location'}
            </button>
          </div>
        )}

        {/* Quick Stats or Info could go here */}
      </div>
    </div>
  );
}