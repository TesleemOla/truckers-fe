"use client";

import { GoogleMapBase } from "./GoogleMapBase";

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
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-xs text-slate-400">
        Origin and destination coordinates are required to show the route.
      </div>
    );
  }

  const originLatLng = { lat: Number(origin.latitude), lng: Number(origin.longitude) };
  const destLatLng = { lat: Number(destination.latitude), lng: Number(destination.longitude) };
  const markers = [originLatLng, destLatLng];
  if (lastReportedLocation?.latitude && lastReportedLocation?.longitude) {
    markers.push({
      lat: Number(lastReportedLocation.latitude),
      lng: Number(lastReportedLocation.longitude),
    });
  }

  return (
    <div className="space-y-2">
      <GoogleMapBase
        center={originLatLng}
        zoom={7}
        markers={markers}
        polyline={[originLatLng, destLatLng]}
      />
      <p className="text-[11px] text-slate-400">
        From <span className="text-slate-200">{origin.address}</span> to{" "}
        <span className="text-slate-200">{destination.address}</span>
        {lastReportedLocation?.address && (
          <>
            {" · "}
            Latest report:{" "}
            <span className="text-slate-200">{lastReportedLocation.address}</span>
          </>
        )}
      </p>
    </div>
  );
}


