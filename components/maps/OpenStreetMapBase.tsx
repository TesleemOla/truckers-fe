"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import { useEffect, useMemo } from "react";

type LatLng = { lat: number; lng: number };

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "260px",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

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
  useEffect(() => {
    // Fix for Leaflet marker icons in Next.js/React
    const fixLeafletIcons = async () => {
      const L = (await import("leaflet")).default;

      // Check if the hack is already applied to avoid double-application in strict mode
      // @ts-ignore - _getIconUrl is an internal Leaflet method
      if (!L.Icon.Default.prototype._getIconUrl) return;

      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    };

    fixLeafletIcons();
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

      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]}>
          {markerLabels[index] && <Popup>{markerLabels[index]}</Popup>}
        </Marker>
      ))}

      {polyline && polyline.length > 1 && (
        <Polyline
          positions={polyline.map(p => [p.lat, p.lng])}
          color="blue"
          weight={3}
          opacity={0.7}
        />
      )}
    </MapContainer>
  );
}