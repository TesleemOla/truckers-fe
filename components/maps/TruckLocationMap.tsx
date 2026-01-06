"use client"
import { Loader } from "lucide-react";
import dynamic from "next/dynamic";

const OpenStreetMapBase = dynamic(() => import('./OpenStreetMapBase'), {
  ssr: false,
  loading: () => <Loader />,
});


type TruckLocation = {
  latitude?: number;
  longitude?: number;
  address?: string;
};

export function TruckLocationMap({ location }: { location?: TruckLocation }) {
  if (!location?.latitude || !location?.longitude) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600">
        No GPS coordinates yet for this truck.
      </div>
    );
  }

  const center = { lat: Number(location.latitude), lng: Number(location.longitude) };

  return (
    <div className="space-y-2"> 
      <OpenStreetMapBase center={center} zoom={9} markers={[center]} markerLabels={["Truck Location"]} />
      {location.address && (
        <p className="text-[11px] text-slate-600">
          Last reported location: <span className="text-slate-800 font-medium">{location.address}</span>
        </p>
      )}
    </div>
  );
}
