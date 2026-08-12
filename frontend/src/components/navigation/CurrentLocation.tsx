'use client';

interface CurrentLocationProps {
  position: { x: number; y: number } | undefined;
}

/**
 * Pulsing blue/green dot representing the user's current location.
 *
 * The position comes ONLY from the `currentLocation` variable (a node name
 * mapped to coordinates). It is NOT hardcoded to BLE — the source of the
 * variable can later be BLE, QR, NFC, Wi-Fi, Computer Vision, or manual.
 */
export function CurrentLocation({ position }: CurrentLocationProps) {
  if (!position) return null;

  return (
    <g>
      {/* expanding pulse ring */}
      <circle cx={position.x} cy={position.y} r="8" fill="#22c55e" opacity="0.35">
        <animate
          attributeName="r"
          values="6;20;6"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0;0.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      {/* solid core */}
      <circle
        cx={position.x}
        cy={position.y}
        r="6"
        fill="#22c55e"
        stroke="#ffffff"
        strokeWidth="2.5"
      />
    </g>
  );
}
