"use client";

import React, { useEffect, useState } from "react";
import { AuthUser, Truck, Manifest, getManifests } from "@/lib/api";
import { Truck as TruckIcon } from "lucide-react";
import { toast } from "sonner";
import { isBackendError } from "@/lib/error";
import { socket } from "@/lib/socket";
import { AuthProvider } from "@/app/context/AuthContext";
import CurrentManifestCard from "./CurrentManifestCard";
import TruckStatusCard from "./TruckStatusCard";
import { useRouter } from "next/navigation";

interface DriverDashboardProps {
  user: AuthUser;
  trucks: Truck[];
}

export default function DriverDashboard({
  user,
  trucks,
}: DriverDashboardProps) {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [activeManifest, setActiveManifest] = useState<Manifest | undefined>();
  const [myTruck, setMyTruck] = useState<Truck | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchManifests() {
      try {
        const data = await getManifests();
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
    const currentTruck = trucks.find(
      (t) => t.assignedDriver?._id === user?.user._id
    );
    setMyTruck(currentTruck);

    if (currentManifest) {
      socket.connect();
      socket.emit("joinManifest", currentManifest._id);
      socket.on("locationUpdated", (data: any) => {
        console.log("Received live update:", data);
      });

      return () => {
        socket.off("locationUpdated");
      };
    }
  }, [manifests, user?.user._id, trucks]);

  const handleRefresh = () => {
    router.refresh(); // Refresh server components
    // Re-fetch client-side manifests
    getManifests()
      .then(setManifests)
      .catch((err) => console.error(err));
  };

  if (!activeManifest) {
    return (
      <AuthProvider>
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <TruckIcon className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No Assignments found
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            You currently don&apos;t have an active truck or manifest assigned.
          </p>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <CurrentManifestCard
            manifest={activeManifest}
            loading={loading}
            setLoading={setLoading}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="space-y-6">
          <TruckStatusCard
            myTruck={myTruck}
            activeManifestId={activeManifest?._id}
            loading={loading}
            setLoading={setLoading}
            onRefresh={handleRefresh}
          />
        </div>
      </div>
    </AuthProvider>
  );
}