import { graph } from "./graph";
import { dijkstra } from "./dijkstra";
import { directions } from "./direction";

export function navigate(
  currentLocation: string,
  destination: string
) {
  const result = dijkstra(graph, currentLocation, destination);

  const instructions = [];

  for (let i = 0; i < result.path.length - 1; i++) {
    const from = result.path[i];
    const to = result.path[i + 1];

    const step = directions.find(
      (d) => d.from === from && d.to === to
    );

    instructions.push(
      step
        ? step.instruction
        : `Move from ${from} to ${to}`
    );
  }

  return {
    path: result.path,
    distance: result.distance,
    instructions,
  };
}