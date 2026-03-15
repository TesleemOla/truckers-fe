"use client";

import React, { useEffect, useState } from "react";
import { Truck, updateManifestLocation, updateTruckLocation } from "@/lib/api";
import { MapPin, Truck as TruckIcon } from "lucide-react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";

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
    const [localTruck, setLocalTruck] = useState<Truck | undefined>(myTruck);
    const [isAutoTracking, setIsAutoTracking] = useState<boolean>(true);

    useEffect(() => {
        setLocalTruck(myTruck);
    }, [myTruck]);

    // WebSocket implementation for real-time updates
    useEffect(() => {
        if (!localTruck?._id) return;

        const truckId = localTruck._id;

        // Ensure socket is connected
        if (!socket.connected) {
            socket.connect();
        }

        // Join the truck's specific room
        socket.emit("joinTruck", truckId);

        // Listen for location updates
        const handleLocationUpdate = (payload: any) => {
            console.log("Real-time truck location update received:", payload);
            if (payload.truckId === truckId) {
                setLocalTruck(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        currentLocation: {
                            ...prev.currentLocation,
                            latitude: payload.location?.latitude || payload.latitude,
                            longitude: payload.location?.longitude || payload.longitude,
                            address: payload.location?.address || payload.address || prev.currentLocation?.address,
                            lastUpdated: payload.timestamp || new Date().toISOString(),
                        }
                    };
                });
            }
        };

        // Also listen to global updates if necessary
        const handleGlobalUpdate = (payload: any) => {
            if (payload.truckId === truckId) {
                handleLocationUpdate(payload);
            }
        };

        socket.on("truckLocationUpdated", handleLocationUpdate);
        socket.on("allTruckLocationUpdates", handleGlobalUpdate);

        return () => {
            socket.off("truckLocationUpdated", handleLocationUpdate);
            socket.off("allTruckLocationUpdates", handleGlobalUpdate);
            // We don't necessarily want to disconnect here as other components might use it,
            // but we should leave the room if the backend supports it.
            // For now, just cleaning up the listeners is enough.
        };
    }, [localTruck?._id]);

    useEffect(() => {
        async function reverseGeocode() {
            if (
                !localTruck?.currentLocation?.latitude ||
                !localTruck?.currentLocation?.longitude
            ) {
                setCurrentAddress(null);
                return;
            }

            if (localTruck.currentLocation.address) {
                setCurrentAddress(localTruck.currentLocation.address);
                return;
            }

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lon=${localTruck.currentLocation.longitude}&lat=${localTruck.currentLocation.latitude}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setCurrentAddress(
                        data.display_name ||
                        `${localTruck.currentLocation.latitude}, ${localTruck.currentLocation.longitude}`
                    );
                } else {
                    setCurrentAddress(
                        `${localTruck.currentLocation.latitude}, ${localTruck.currentLocation.longitude}`
                    );
                }
            } catch (error) {
                console.error("Reverse geocoding error:", error);
                setCurrentAddress(
                    `${localTruck.currentLocation.latitude}, ${localTruck.currentLocation.longitude}`
                );
            }
        }

        reverseGeocode();
    }, [
        localTruck?.currentLocation?.latitude,
        localTruck?.currentLocation?.longitude,
        localTruck?.currentLocation?.address,
    ]);

    // Implement watchPosition for hands-free live tracking
    useEffect(() => {
        if (!isAutoTracking || !localTruck?._id || !navigator.geolocation) return;

        const truckId = localTruck._id;
        let lastUpdateTime = 0;
        // Throttle to 10 seconds to avoid spamming the backend API
        const THROTTLE_MS = 10000;

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const now = Date.now();
                if (now - lastUpdateTime < THROTTLE_MS) return;
                lastUpdateTime = now;

                const { latitude, longitude } = position.coords;
                try {
                    // Update location via API - this will trigger the backend's websocket emit
                    await updateTruckLocation(truckId, { latitude, longitude });
                    if (activeManifestId) {
                        await updateManifestLocation(activeManifestId, {
                            latitude,
                            longitude,
                        });
                    }
                } catch (error) {
                    console.error("Auto-update location failed:", error);
                }
            },
            (error) => {
                console.error("Geolocation watch error:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setIsAutoTracking(false);
                    toast.error("Automatic tracking disabled. Please enable you device location!");
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [isAutoTracking, localTruck?._id, activeManifestId]);

    const handleUpdateLocation = () => {
        if (!localTruck?._id) return;
        const truckId = localTruck._id;

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await updateTruckLocation(truckId, { latitude, longitude });
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

    if (!localTruck) return null;

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
                    <h3 className="font-bold text-slate-900">{localTruck.truckNumber}</h3>
                    <p className="text-xs text-slate-400">
                        {localTruck.make} {localTruck.model}
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
                                (localTruck.currentLocation?.latitude
                                    ? `${localTruck.currentLocation.latitude}, ${localTruck.currentLocation.longitude}`
                                    : "No location data")}
                        </p>
                        {localTruck.currentLocation?.lastUpdated && (
                            <p
                                className="mt-1 text-[10px] text-slate-400"
                                suppressHydrationWarning
                            >
                                Updated:{" "}
                                {new Date(
                                    localTruck.currentLocation.lastUpdated
                                ).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full">
                <button
                    onClick={handleUpdateLocation}
                    disabled={loading}
                    className="btn-primary flex-1"
                >
                    {loading ? "Updating..." : "Update Now"}
                </button>
                <button
                    onClick={() => setIsAutoTracking(!isAutoTracking)}
                    className={`px-4 py-3 rounded-xl font-medium border transition-colors flex items-center gap-2 ${isAutoTracking
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${isAutoTracking ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                    {isAutoTracking ? "Auto: ON" : "Auto: OFF"}
                </button>
            </div>
        </div>
    );
}
