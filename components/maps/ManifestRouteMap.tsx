"use client";

import  OpenStreetMapBase  from "./OpenStreetMapBase";
import dynamic from "next/dynamic";

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
  origin?: Point;
  destination?: Point;
  lastReportedLocation?: Point;
};

export function ManifestRouteMap({
  origin,
  destination,
  lastReportedLocation,
}: ManifestLocation) {
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

  if (lastReportedLocation?.latitude && lastReportedLocation?.longitude) {
    markers.push({
      lat: Number(lastReportedLocation.latitude),
      lng: Number(lastReportedLocation.longitude),
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
        {lastReportedLocation?.address && (
          <>
            {" · "}
            Latest report:{" "}
            <span className="text-slate-800 font-medium">{lastReportedLocation.address}</span>
          </>
        )}
      </p>
    </div>
  );
}


