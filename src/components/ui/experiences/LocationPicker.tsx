"use client";

import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Fix default Leaflet marker icon (webpack strips the default assets) ── */
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

/* ── Default centre (Paris) ─────────────────────────────────────────────── */
const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];
const DEFAULT_ZOOM = 5;
const PLACED_ZOOM = 14;

/* ── Sub-components ─────────────────────────────────────────────────────── */

/** Listens for click events on the map and calls onChange */
function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(
        Math.round(e.latlng.lat * 1_000_000) / 1_000_000,
        Math.round(e.latlng.lng * 1_000_000) / 1_000_000,
      );
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), PLACED_ZOOM), {
      duration: 0.8,
    });
  }, [lat, lng, map]);
  return null;
}

interface LocationPickerProps {
  latitude?: number | "";
  longitude?: number | "";
  onChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const hasMarker =
    latitude !== "" &&
    latitude !== undefined &&
    longitude !== "" &&
    longitude !== undefined;

  const center: [number, number] = hasMarker
    ? [latitude as number, longitude as number]
    : DEFAULT_CENTER;

  const zoom = hasMarker ? PLACED_ZOOM : DEFAULT_ZOOM;

  /* Make marker draggable — update on dragend */
  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target as L.Marker;
        const pos = marker.getLatLng();
        onChange(
          Math.round(pos.lat * 1_000_000) / 1_000_000,
          Math.round(pos.lng * 1_000_000) / 1_000_000,
        );
      },
    }),
    [onChange],
  );

  return (
    <div className="rounded-xl overflow-hidden border border-gray-light shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: 400, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onChange={onChange} />

        {hasMarker && (
          <>
            <Marker
              position={[latitude as number, longitude as number]}
              draggable
              eventHandlers={eventHandlers}
            />
            <FlyTo lat={latitude as number} lng={longitude as number} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
