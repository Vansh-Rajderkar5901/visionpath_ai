// Represents a connection between two nodes
export interface Edge {
  from: string;
  to: string;
  distance: number;
}

// Graph representation used by Dijkstra
export interface Graph {
  [node: string]: {
    [neighbor: string]: number;
  };
}

// Represents a navigation instruction
export interface Direction {
  from: string;
  to: string;
  instruction: string;
}