import { Graph } from "./types";

/**
 * Finds the shortest path between two nodes using Dijkstra's Algorithm.
 *
 * @param graph - Navigation graph
 * @param start - Current location
 * @param end - Destination
 * @returns Shortest path and total distance
 */

export function dijkstra(
  graph: Graph,
  start: string,
  end: string
): { path: string[]; distance: number } {

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();

  // Initialize distances
  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[start] = 0;

  while (visited.size < Object.keys(graph).length) {

    let currentNode: string | null = null;
    let shortestDistance = Infinity;

    // Find the nearest unvisited node
    Object.keys(distances).forEach(node => {
      if (!visited.has(node) && distances[node] < shortestDistance) {
        shortestDistance = distances[node];
        currentNode = node;
      }
    });

    if (currentNode === null) break;

    if (currentNode === end) break;

    visited.add(currentNode);

    const neighbors = graph[currentNode];

    for (const neighbor in neighbors) {

      const newDistance =
        distances[currentNode] + neighbors[neighbor];

      if (newDistance < distances[neighbor]) {

        distances[neighbor] = newDistance;

        previous[neighbor] = currentNode;

      }

    }

  }

  // Build shortest path
  const path: string[] = [];

  let current: string | null = end;

  while (current) {

    path.unshift(current);

    current = previous[current];

  }

  return {

    path,

    distance: distances[end],

  };

}