"use client";

import React, { useState } from "react";
import { Manifest, recordArrival, recordDeparture } from "@/lib/api";
import { ManifestRouteMap } from "./maps/ManifestRouteMap";
import { CheckCircle, Clock, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CurrentManifestCardProps {
    manifest: Manifest | undefined;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    onRefresh: () => void;
}

export default function CurrentManifestCard({
    manifest,
    loading,
    setLoading,
    onRefresh,
}: CurrentManifestCardProps) {
    const router = useRouter();

    const handleStatusChange = async (action: "start" | "complete") => {
        if (!manifest) return;
        setLoading(true);
        try {
            if (action === "start") {
                await recordDeparture(manifest._id);
                toast.success("Route started! Drive safely.");
            } else {
                await recordArrival(manifest._id);
                toast.success("Route completed! Great job.");
            }
            onRefresh();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : `Failed to ${action} route`;
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!manifest) {
        return (
            <div className="glass-card flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Clock className="mb-3 h-10 w-10 text-slate-300" />
                <p>No active manifests scheduled.</p>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Current Manifest</h3>
                        <p className="text-xs text-slate-500">#{manifest.manifestNumber}</p>
                    </div>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${manifest.status.toLowerCase() === "in-transit"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                    >
                        {manifest.status.replace("-", " ")}
                    </span>
                </div>
            </div>

            <div className="p-0">
                <ManifestRouteMap
                    manifestId={manifest._id}
                    origin={manifest.origin}
                    destination={manifest.destination}
                    lastReportedLocation={manifest.lastReportedLocation}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 p-6">
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Origin
                    </p>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full border border-blue-500 bg-blue-50 p-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            {manifest.origin.address}
                        </p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Destination
                    </p>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5 rounded-full border border-emerald-500 bg-emerald-50 p-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                            {manifest.destination.address}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                {manifest.status.toLowerCase() === "scheduled" ||
                    manifest.status.toLowerCase() === "pending" ? (
                    <button
                        onClick={() => handleStatusChange("start")}
                        disabled={loading}
                        className="btn-primary"
                    >
                        <Navigation className="mr-2 h-4 w-4" />
                        Start Route
                    </button>
                ) : manifest.status.toLowerCase() === "in-transit" ? (
                    <button
                        onClick={() => handleStatusChange("complete")}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Route
                    </button>
                ) : null}
            </div>
        </div>
    );
}
