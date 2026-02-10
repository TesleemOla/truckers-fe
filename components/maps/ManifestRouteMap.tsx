"use client";

import OpenStreetMapBase from "./OpenStreetMapBase";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

const DynamicOpenStreetMapBase = dynamic(
  () => Promise.resolve(OpenStreetMapBase),
  { ssr: false }
);

type Point = {
  latitude?: number;
  longitude?: number;
  address?: string;
};

type ManifestLocation = {
  manifestId?: string;
  origin?: Point;
  destination?: Point;
  lastReportedLocation?: Point;
};

export function ManifestRouteMap({
  manifestId,
  origin,
  destination,
  lastReportedLocation: initialLocation,
}: ManifestLocation) {
  const [liveLocation, setLiveLocation] = useState<Point | undefined>(initialLocation);

  useEffect(() => {
    setLiveLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    if (!manifestId) return;

    socket.connect();
    socket.emit("joinManifest", manifestId);

    const handleLocationUpdate = (data: any) => {
      console.log("Received live update for manifest:", manifestId, data);
      if (data.location) {
        setLiveLocation(data.location);
      }
    };

    socket.on("locationUpdated", handleLocationUpdate);

    return () => {
      socket.off("locationUpdated", handleLocationUpdate);
      // We don't disconnect here because other components might be using the socket
    };
  }, [manifestId]);

  if (!origin?.latitude || !origin?.longitude || !destination?.latitude || !destination?.longitude) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600">
        Origin and destination coordinates are required to show the route.
      </div>
    );
  }

  const originLatLng = { lat: Number(origin.latitude), lng: Number(origin.longitude) };
  const destLatLng = { lat: Number(destination.latitude), lng: Number(destination.longitude) };
  const markers = [originLatLng, destLatLng];
  const markerLabels = ["Origin", "Destination"];

  if (liveLocation?.latitude && liveLocation?.longitude) {
    markers.push({
      lat: Number(liveLocation.latitude),
      lng: Number(liveLocation.longitude),
    });
    markerLabels.push("Current Location");
  }

  return (
    <div className="space-y-2">
      <DynamicOpenStreetMapBase
        center={originLatLng}
        zoom={7}
        markers={markers}
        markerLabels={markerLabels}
        polyline={[originLatLng, destLatLng]}
      />
      <p className="text-[11px] text-slate-600">
        From <span className="text-slate-800 font-medium">{origin.address}</span> to{" "}
        <span className="text-slate-800 font-medium">{destination.address}</span>
        {liveLocation?.address && (
          <>
            {" · "}
            Latest report:{" "}
            <span className="text-slate-800 font-medium">{liveLocation.address}</span>
          </>
        )}
      </p>
    </div>
  );
}


