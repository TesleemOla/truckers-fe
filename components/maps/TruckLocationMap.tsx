"use client";

import { GoogleMapBase } from "./GoogleMapBase";

type TruckLocation = {
  latitude?: number;
  longitude?: number;
  address?: string;
};

export function TruckLocationMap({ location }: { location?: TruckLocation }) {
  if (!location?.latitude || !location?.longitude) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-xs text-slate-400">
        No GPS coordinates yet for this truck.
      </div>
    );
  }

  const center = { lat: Number(location.latitude), lng: Number(location.longitude) };

  return (
    <div className="space-y-2">
      <GoogleMapBase center={center} zoom={9} markers={[center]} />
      {location.address && (
        <p className="text-[11px] text-slate-400">
          Last reported location: <span className="text-slate-200">{location.address}</span>
        </p>
      )}
    </div>
  );
}


