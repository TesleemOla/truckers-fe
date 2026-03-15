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

// Icons
const truckSvg = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="white" stroke="#3b82f6" stroke-width="3" />
  <path d="M28 16V21C28 22.1046 27.1046 23 26 23H25.8297C25.4175 21.8348 24.3062 21 23 21C21.6938 21 20.5825 21.8348 20.1703 23H13.8297C13.4175 21.8348 12.3062 21 11 21C9.69378 21 8.58254 21.8348 8.17033 23H8V14C8 12.8954 8.89543 12 10 12H19V16H28ZM20 16V10H23L27.5 14.5V16H20Z" fill="#3b82f6" />
  <circle cx="11" cy="23" r="2.5" fill="#1e3a8a" />
  <circle cx="23" cy="23" r="2.5" fill="#1e3a8a" />
</svg>
`;

const originSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2C10.477 2 6 6.477 6 12C6 21 16 30 16 30C16 30 26 21 26 12C26 6.477 21.523 2 16 2ZM16 16C13.791 16 12 14.209 12 12C12 9.791 13.791 8 16 8C18.209 8 20 9.791 20 12C20 14.209 18.209 16 16 16Z" fill="#10b981"/>
  <circle cx="16" cy="12" r="4" fill="white"/>
</svg>
`;

const destinationSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2C10.477 2 6 6.477 6 12C6 21 16 30 16 30C16 30 26 21 26 12C26 6.477 21.523 2 16 2ZM16 16C13.791 16 12 14.209 12 12C12 9.791 13.791 8 16 8C18.209 8 20 9.791 20 12C20 14.209 18.209 16 16 16Z" fill="#ef4444"/>
  <circle cx="16" cy="12" r="4" fill="white"/>
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
  const [icons, setIcons] = useState<{ origin: any; destination: any; truck: any } | null>(null);
  const [routedPath, setRoutedPath] = useState<[number, number][]>([]);

  // Track the most recent truck position for the camera
  const latestTruckPosition = markers.length > 0 ? markers[markers.length - 1] : null;

  useEffect(() => {
    const initLeaflet = async () => {
      const L = (await import("leaflet")).default;

      const createIcon = (svg: string, size: [number, number], anchor: [number, number]) =>
        new L.Icon({
          iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
          iconSize: size,
          iconAnchor: anchor,
          popupAnchor: [0, -anchor[1]],
        });

      setIcons({
        origin: createIcon(originSvg, [32, 32], [16, 32]),
        destination: createIcon(destinationSvg, [32, 32], [16, 32]),
        truck: createIcon(truckSvg, [40, 40], [20, 20]),
      });
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

      {icons && markers.map((marker, index) => {
        const label = markerLabels[index] || "";
        let icon = icons.truck;
        if (label.toLowerCase() === "origin" || label.toLowerCase() === "departure") {
          icon = icons.origin;
        } else if (label.toLowerCase() === "destination") {
          icon = icons.destination;
        }

        return (
          <Marker key={`marker-${index}`} position={[marker.lat, marker.lng]} icon={icon}>
            {label && <Popup>{label}</Popup>}
          </Marker>
        );
      })}
    </MapContainer>
  );
}