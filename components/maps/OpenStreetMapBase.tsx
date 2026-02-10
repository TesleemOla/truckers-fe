"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "260px",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

// SVG Marker Template
const markerSvg = `
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21.7C17.3 17 20 13 20 8.8C20 4.5 16.4 1 12 1C7.6 1 4 4.5 4 8.8C4 13 6.7 17 12 21.7Z" fill="#2563eb" stroke="white" stroke-width="1.5"/>
  <circle cx="12" cy="8.8" r="3" fill="white"/>
</svg>
`;

export default function OpenStreetMapBase({
  center,
  zoom = 13,
  markers = [],
  polyline,
  markerLabels = [],
}: {
  center: LatLng;
  zoom?: number;
  markers?: LatLng[];
  polyline?: LatLng[];
  markerLabels?: string[];
}) {
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    // Initialize Leaflet icon only on client side
    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      const icon = new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(markerSvg)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 29],
        popupAnchor: [0, -29],
        className: "custom-leaflet-icon"
      });

      setCustomIcon(icon);
    };

    initLeaflet();
  }, []);

  const mapKey = useMemo(
    () => `${center.lat}-${center.lng}-${zoom}`,
    [center.lat, center.lng, zoom]
  );

  return (
    <MapContainer
      key={mapKey}
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={containerStyle}
      className="rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {customIcon && markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.lat, marker.lng]}
          icon={customIcon}
        >
          {markerLabels[index] && <Popup>{markerLabels[index]}</Popup>}
        </Marker>
      ))}

      {polyline && polyline.length > 1 && (
        <Polyline
          positions={polyline.map(p => [p.lat, p.lng])}
          color="#2563eb"
          weight={4}
          opacity={0.8}
        />
      )}
    </MapContainer>
  );
}
