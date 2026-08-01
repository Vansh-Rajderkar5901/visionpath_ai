"use client";

import { graph } from "@/navigation/graph";
import { dijkstra } from "@/navigation/dijkstra";

export default function TestPage() {

  const result = dijkstra(
    graph,
    "Lift_Area",
    "BS18A"
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1>Dijkstra Test</h1>

      <h2>Shortest Path</h2>

      <ul>
        {result.path.map((node) => (
          <li key={node}>{node}</li>
        ))}
      </ul>

      <h2>Total Distance</h2>

      <p>{result.distance} meters</p>

    </div>
  );
}