"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "260px",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

// Red Truck SVG
const truckSvg = `
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 13V17C20 18.1046 19.1046 19 18 19H17.8297C17.4175 17.8348 16.3062 17 15 17C13.6938 17 12.5825 17.8348 12.1703 19H7.82967C7.41746 17.8348 6.30622 17 5 17C3.69378 17 2.58254 17.8348 2.17033 19H2V11C2 9.89543 2.89543 9 4 9H13V13H20ZM14 13V7H17L22 12V13H14Z" fill="#ef4444"/>
  <circle cx="5" cy="19" r="2" fill="#1f2937"/>
  <circle cx="15" cy="19" r="2" fill="#1f2937"/>
</svg>
`;

// Helper component to handle camera movement
function RecenterMap({ position }: { position: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo([position.lat, position.lng], { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
}

export default function OpenStreetMapBase({
  center,
  zoom = 60,
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
  const [truckIcon, setTruckIcon] = useState<any>(null);
  const [routedPath, setRoutedPath] = useState<[number, number][]>([]);

  // Track the most recent truck position for the camera
  const latestTruckPosition = markers.length > 0 ? markers[markers.length - 1] : null;

  useEffect(() => {
    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;
      const icon = new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(truckSvg)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
      setTruckIcon(icon);
    };
    initLeaflet();
  }, []);

  useEffect(() => {
    if (!polyline || polyline.length < 2) {
      setRoutedPath([]);
      return;
    }

    const fetchRoute = async () => {
      const coordinates = polyline.map(p => `${p.lng},${p.lat}`).join(';');
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRoutedPath(coords);
        }
      } catch (error) {
        console.error("OSRM Routing error:", error);
      }
    };
    fetchRoute();
  }, [polyline]);

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Auto-centering component */}
      <RecenterMap position={latestTruckPosition} />

      {routedPath.length > 0 && (
        <Polyline
          positions={routedPath}
          color="#2563eb"
          weight={5}
          opacity={0.7}
        />
      )}

      {truckIcon && markers.map((marker, index) => (
        <Marker key={`truck-${index}`} position={[marker.lat, marker.lng]} icon={truckIcon}>
          {markerLabels[index] && <Popup>{markerLabels[index]}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}