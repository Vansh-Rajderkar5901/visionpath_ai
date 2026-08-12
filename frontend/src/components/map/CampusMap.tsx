'use client';

import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Building } from '@/types';

/**
 * Leaflet's default marker points at image files that bundlers rewrite, which
 * is the usual cause of invisible pins. A div icon sidesteps the issue and
 * keeps the pin styled with the app's own colours.
 */
function buildingIcon(selected: boolean): L.DivIcon {
  const fill = selected ? '#4f46e5' : '#6366f1';
  return L.divIcon({
    className: 'visionpath-marker',
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:28px;height:28px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${fill};
        border:2px solid #ffffff;
        box-shadow:0 2px 6px rgba(0,0,0,.35);
      ">
        <span style="
          width:8px;height:8px;border-radius:50%;background:#ffffff;
          transform:rotate(45deg);
        "></span>
      </span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

/**
 * MapContainer only reads `center` and `zoom` on mount, so panning to a newly
 * selected building needs an imperative nudge from inside the map context.
 */
function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.75 });
  }, [center, map, zoom]);

  return null;
}

interface CampusMapProps {
  buildings: Building[];
  center: [number, number];
  zoom: number;
  selectedBuildingId?: string | null;
  onBuildingSelect?: (building: Building) => void;
}

export default function CampusMap({
  buildings,
  center,
  zoom,
  selectedBuildingId,
  onBuildingSelect,
}: CampusMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} className="w-full h-full" zoomControl={false}>
      <MapViewController center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {buildings.map((building) => (
        <Marker
          key={building.id}
          position={[building.latitude, building.longitude]}
          icon={buildingIcon(building.id === selectedBuildingId)}
          eventHandlers={{
            click: () => onBuildingSelect?.(building),
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{building.name}</strong>
              <br />
              {building.code} • {building.floors.length}{' '}
              {building.floors.length === 1 ? 'floor' : 'floors'}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
