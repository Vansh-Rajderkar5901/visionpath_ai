'use client';

import { Room } from './Room';
import { CurrentLocation } from './CurrentLocation';
import { NavigationPath } from './NavigationPath';
import {
  MAP_VIEWBOX,
  NODE_POSITIONS,
  SELECTABLE_ROOMS,
  CORRIDOR_LINES,
  JUNCTION_LABELS,
} from './indoorMapData';

interface IndoorMapProps {
  selectedDestination: string | null;
  onSelectDestination: (node: string) => void;
  currentLocation: string;
  route: string[];
}

/**
 * The indoor floor plan.
 *
 * Rooms are laid out with CSS Grid (10 columns x 8 rows). An SVG overlay
 * (same 1000x720 coordinate space) draws the corridor network, the animated
 * navigation route, the current-location dot and the destination marker.
 */
export function IndoorMap({
  selectedDestination,
  onSelectDestination,
  currentLocation,
  route,
}: IndoorMapProps) {
  const currentPos = NODE_POSITIONS[currentLocation];

  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-border dark:to-dark-card">
      {/* Legend bar (above the map, not overlapping) */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-dark-border bg-white/70 dark:bg-dark-card/70 text-[11px] sm:text-xs text-gray-600 dark:text-gray-300">
        <span className="font-semibold text-gray-500 dark:text-gray-400">Legend</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded-full bg-primary-600" />
          Route
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
          Destination
        </span>
      </div>

      {/* Grid floor plan */}
      <div
        className="relative w-full"
        style={{ aspectRatio: `${MAP_VIEWBOX.width} / ${MAP_VIEWBOX.height}` }}
      >
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 0v100M0 100h100' stroke='%236366f1' stroke-width='0.5'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Corridors + rooms via CSS Grid */}
<div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-2 p-3">
          {SELECTABLE_ROOMS.map((room) => (
            <div
              key={room.id}
              className="relative"
              style={{
                gridColumn: room.gridColumn,
                gridRow: room.gridRow,
              }}
            >
              <Room
                label={room.label}
                selected={selectedDestination === room.navNode}
                onClick={() => onSelectDestination(room.navNode)}
              />
            </div>
          ))}
        </div>

        {/* SVG overlay: corridors + route + location */}
        <svg
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* corridor network */}
          <g>
            {CORRIDOR_LINES.map(([x1, y1, x2, y2], i) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.35"
              />
            ))}
          </g>

          {/* junction labels */}
          <g>
            {JUNCTION_LABELS.map((j, i) => (
              <text
                key={i}
                x={j.x}
                y={j.y}
                textAnchor="middle"
                fontSize="11"
                fill="#9ca3af"
                fontWeight="500"
              >
                {j.text}
              </text>
            ))}
          </g>

          {/* navigation route + destination */}
          <NavigationPath route={route} positions={NODE_POSITIONS} />

          {/* current location dot */}
          <CurrentLocation position={currentPos} />
        </svg>
      </div>
    </div>
  );
}
