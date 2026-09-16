'use client';

interface NavigationPathProps {
  route: string[];
  positions: Record<string, { x: number; y: number }>;
}

/**
 * SVG overlay that draws the Dijkstra route over the floor plan.
 * - Animated dashed blue line along the corridors.
 * - Pulsing marker at the destination.
 * Uses the exact same 1000 x 720 coordinate space as the floor plan.
 */
export function NavigationPath({ route, positions }: NavigationPathProps) {
  if (!route || route.length < 2) return null;

  const points = route
    .map((node) => positions[node])
    .filter((p): p is { x: number; y: number } => Boolean(p));

  if (points.length < 2) return null;

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const destination = points[points.length - 1];

  return (
    <g>
      {/* soft glow under the route */}
      <path
        d={d}
        fill="none"
        stroke="#6366f1"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.18"
      />
      {/* animated main route */}
      <path
        d={d}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="14 10"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="24"
          to="0"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>

      {/* destination marker */}
      {destination && (
        <g>
          <circle cx={destination.x} cy={destination.y} r="10" fill="#4f46e5" opacity="0.25">
            <animate
              attributeName="r"
              values="8;22;8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={destination.x}
            cy={destination.y}
            r="8"
            fill="#4f46e5"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
        </g>
      )}
    </g>
  );
}
