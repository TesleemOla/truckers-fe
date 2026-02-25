"use client";

import React, { useEffect, useState } from "react";
import { AuthUser, Truck, Manifest, getManifests, getTrucks } from "@/lib/api";
import { Truck as TruckIcon } from "lucide-react";
import { toast } from "sonner";
import { isBackendError } from "@/lib/error";
import { socket } from "@/lib/socket";
import CurrentManifestCard from "./CurrentManifestCard";
import TruckStatusCard from "./TruckStatusCard";
import { useRouter } from "next/navigation";

interface DriverDashboardProps {
  user: AuthUser;
}

export default function DriverDashboard({
  user
}: DriverDashboardProps) {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [activeManifest, setActiveManifest] = useState<Manifest | undefined>();
  const [myTruck, setMyTruck] = useState<Truck | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [manifestData, truckData] = await Promise.all([
          getManifests(),
          getTrucks()
        ]);

        setManifests(manifestData);

        // Find the truck assigned to this driver
        const userId = user?.user?._id;
        const currentTruck = truckData.find(
          (t) => t.assignedDriver?._id === userId
        );
        setMyTruck(currentTruck);
      } catch (error) {
        if (isBackendError(error)) {
          toast.error(error.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  useEffect(() => {
    const currentManifest = manifests.find((m) => m.status === "in-transit");
    setActiveManifest(currentManifest);

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
  }, [manifests, user]);

  const handleRefresh = () => {
    router.refresh();
    // Re-fetch manifests and trucks
    Promise.all([getManifests(), getTrucks()])
      .then(([manifestData, truckData]) => {
        setManifests(manifestData);
        const userId = user?.user?._id;
        const currentTruck = truckData.find(
          (t) => t.assignedDriver?._id === userId
        );
        setMyTruck(currentTruck);
      })
      .catch((err) => console.error(err));
  };

  if (!activeManifest) {
    return (
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
    );
  }

  return (
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
  );
}