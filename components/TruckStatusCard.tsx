"use client";

import React, { useEffect, useState } from "react";
import { Truck, updateManifestLocation, updateTruckLocation } from "@/lib/api";
import { MapPin, Truck as TruckIcon } from "lucide-react";
import { toast } from "sonner";

interface TruckStatusCardProps {
    myTruck: Truck | undefined;
    activeManifestId?: string;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    onRefresh: () => void;
}

export default function TruckStatusCard({
    myTruck,
    activeManifestId,
    loading,
    setLoading,
    onRefresh,
}: TruckStatusCardProps) {
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);

    useEffect(() => {
        async function reverseGeocode() {
            if (
                !myTruck?.currentLocation?.latitude ||
                !myTruck?.currentLocation?.longitude
            ) {
                setCurrentAddress(null);
                return;
            }

            if (myTruck.currentLocation.address) {
                setCurrentAddress(myTruck.currentLocation.address);
                return;
            }

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lon=${myTruck.currentLocation.longitude}&lat=${myTruck.currentLocation.latitude}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setCurrentAddress(
                        data.display_name ||
                        `${myTruck.currentLocation.latitude}, ${myTruck.currentLocation.longitude}`
                    );
                } else {
                    setCurrentAddress(
                        `${myTruck.currentLocation.latitude}, ${myTruck.currentLocation.longitude}`
                    );
                }
            } catch (error) {
                console.error("Reverse geocoding error:", error);
                setCurrentAddress(
                    `${myTruck.currentLocation.latitude}, ${myTruck.currentLocation.longitude}`
                );
            }
        }

        reverseGeocode();
    }, [
        myTruck?.currentLocation?.latitude,
        myTruck?.currentLocation?.longitude,
        myTruck?.currentLocation?.address,
    ]);

    const handleUpdateLocation = () => {
        if (!myTruck) return;
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await updateTruckLocation(myTruck._id, { latitude, longitude });
                    if (activeManifestId) {
                        await updateManifestLocation(activeManifestId, {
                            latitude,
                            longitude,
                        });
                    }

                    toast.success("Location updated successfully");
                    onRefresh();
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : "Failed to update location";
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

    if (!myTruck) return null;

    return (
        <div className="glass-card space-y-6 p-6">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                    <TruckIcon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        Assigned Vehicle
                    </p>
                    <h3 className="font-bold text-slate-900">{myTruck.truckNumber}</h3>
                    <p className="text-xs text-slate-400">
                        {myTruck.make} {myTruck.model}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-primary-500" />
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                            Last Reported Location
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                            {currentAddress ||
                                (myTruck.currentLocation?.latitude
                                    ? `${myTruck.currentLocation.latitude}, ${myTruck.currentLocation.longitude}`
                                    : "No location data")}
                        </p>
                        {myTruck.currentLocation?.lastUpdated && (
                            <p
                                className="mt-1 text-[10px] text-slate-400"
                                suppressHydrationWarning
                            >
                                Updated:{" "}
                                {new Date(
                                    myTruck.currentLocation.lastUpdated
                                ).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleUpdateLocation}
                disabled={loading}
                className="btn-primary w-full"
            >
                {loading ? "Updating..." : "Update My Location"}
            </button>
        </div>
    );
}
