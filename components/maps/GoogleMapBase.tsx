"use client";

import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import type React from "react";

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "260px",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

type LatLng = { lat: number; lng: number };

export function GoogleMapBase(props: {
  center: LatLng;
  zoom?: number;
  markers?: LatLng[];
  polyline?: LatLng[];
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
  });

  if (!apiKey) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/70 text-xs text-slate-400">
        Set <span className="mx-1 font-mono text-[11px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> to enable maps.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-xs text-rose-300">
        Unable to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-xs text-slate-300">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={props.center}
      zoom={props.zoom ?? 8}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            elementType: "geometry",
            stylers: [{ color: "#0b1120" }],
          },
          {
            elementType: "labels.text.fill",
            stylers: [{ color: "#e5e7eb" }],
          },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#020617" }],
          },
        ],
      }}
    >
      {props.markers?.map((m, idx) => (
        <Marker key={idx} position={m} />
      ))}
      {props.polyline && (
        <Polyline
          path={props.polyline}
          options={{
            strokeColor: "#3b82f6",
            strokeOpacity: 0.9,
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  );
}


