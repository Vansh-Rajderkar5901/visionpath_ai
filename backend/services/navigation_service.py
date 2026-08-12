"""
Indoor routing.

The graph lives in Postgres (node / edge / direction). Edges are stored once
and treated as bidirectional. Spoken instructions come from the `direction`
table when a row exists for that exact traversal, and are generated from node
names otherwise — so a route is never left without guidance just because the
reverse instruction was never authored.
"""

import heapq
from typing import Iterable, Optional

from sqlalchemy.orm import Session, joinedload

from models.navigation import (
    STATUS_ACTIVE,
    Building,
    Direction,
    Edge,
    Floor,
    Location,
    LocationType,
    Node,
)

# Average indoor walking speed in metres/second, used for the time estimate.
WALKING_SPEED_MPS = 1.2


class NavigationError(Exception):
    """Raised when a route cannot be produced; routers map this to a 4xx."""


class NavigationService:
    def __init__(self, db: Session):
        self.db = db

    # ---------- graph loading ----------

    def load_graph(self) -> dict[str, dict[str, float]]:
        """Build an undirected adjacency map from the active edges."""
        graph: dict[str, dict[str, float]] = {}

        for node_id, in self.db.query(Node.node_id).all():
            graph[node_id] = {}

        edges = self.db.query(Edge).filter(Edge.status == STATUS_ACTIVE).all()
        for edge in edges:
            weight = float(edge.distance or 0)
            graph.setdefault(edge.source_node_id, {})
            graph.setdefault(edge.destination_node_id, {})
            # Keep the cheapest edge if the same pair appears twice.
            existing = graph[edge.source_node_id].get(edge.destination_node_id)
            if existing is None or weight < existing:
                graph[edge.source_node_id][edge.destination_node_id] = weight
                graph[edge.destination_node_id][edge.source_node_id] = weight

        return graph

    # ---------- resolution ----------

    def resolve_node(self, value: str) -> Node:
        """
        Turn user input into a graph node.

        Accepts a node id, a location name, or a display name, and tolerates the
        underscore/space/hyphen differences between spoken and stored forms
        ("Seminar Hall", "seminar_hall", "BS-17A" all resolve).
        """
        if not value or not value.strip():
            raise NavigationError("A location is required")

        raw = value.strip()
        node = self.db.get(Node, raw)
        if node:
            return node

        normalized = self._normalize(raw)

        # Try nodes by normalized id or name.
        for candidate in self.db.query(Node).all():
            if self._normalize(candidate.node_id) == normalized:
                return candidate
            if self._normalize(candidate.node_name) == normalized:
                return candidate

        # Then locations, which is how most spoken destinations arrive.
        for location in self.db.query(Location).filter(Location.node_id.isnot(None)).all():
            if self._normalize(location.location_name) == normalized or (
                location.display_name
                and self._normalize(location.display_name) == normalized
            ):
                return location.node

        raise NavigationError(f'"{value}" is not a place I can route to')

    def resolve_location_node(self, location_id: int) -> Node:
        location = self.db.get(Location, location_id)
        if location is None:
            raise NavigationError("That destination no longer exists")
        if location.node_id is None:
            raise NavigationError(
                f"{location.display_label} is not connected to the navigation map yet"
            )
        return location.node

    @staticmethod
    def _normalize(value: Optional[str]) -> str:
        if not value:
            return ""
        return "".join(char for char in value.lower() if char.isalnum())

    # ---------- routing ----------

    def shortest_path(self, start: str, end: str) -> tuple[list[str], float]:
        """Dijkstra with a binary heap. Raises NavigationError if unreachable."""
        graph = self.load_graph()

        if start not in graph:
            raise NavigationError(f'"{start}" is not on the navigation map')
        if end not in graph:
            raise NavigationError(f'"{end}" is not on the navigation map')
        if start == end:
            return [start], 0.0

        distances: dict[str, float] = {start: 0.0}
        previous: dict[str, Optional[str]] = {start: None}
        visited: set[str] = set()
        queue: list[tuple[float, str]] = [(0.0, start)]

        while queue:
            current_distance, current = heapq.heappop(queue)
            if current in visited:
                continue
            visited.add(current)

            if current == end:
                break

            for neighbour, weight in graph[current].items():
                if neighbour in visited:
                    continue
                candidate = current_distance + weight
                if candidate < distances.get(neighbour, float("inf")):
                    distances[neighbour] = candidate
                    previous[neighbour] = current
                    heapq.heappush(queue, (candidate, neighbour))

        if end not in distances:
            raise NavigationError(
                "There is no walkable route between those two places"
            )

        path: list[str] = []
        cursor: Optional[str] = end
        while cursor is not None:
            path.append(cursor)
            cursor = previous.get(cursor)
        path.reverse()

        return path, distances[end]

    # ---------- instructions ----------

    def _node_labels(self, node_ids: Iterable[str]) -> dict[str, str]:
        ids = list(node_ids)
        if not ids:
            return {}
        nodes = self.db.query(Node).filter(Node.node_id.in_(ids)).all()
        return {node.node_id: node.node_name for node in nodes}

    def _direction_map(self, path: list[str]) -> dict[tuple[str, str], str]:
        if len(path) < 2:
            return {}
        rows = (
            self.db.query(Direction)
            .filter(
                Direction.source_node_id.in_(path),
                Direction.destination_node_id.in_(path),
            )
            .all()
        )
        return {(row.source_node_id, row.destination_node_id): row.instruction for row in rows}

    def build_instructions(
        self, path: list[str], graph: Optional[dict[str, dict[str, float]]] = None
    ) -> list[dict]:
        """Turn a node path into step-by-step guidance."""
        if not path:
            return []

        labels = self._node_labels(path)
        directions = self._direction_map(path)
        graph = graph if graph is not None else self.load_graph()

        start_label = labels.get(path[0], path[0])
        steps: list[dict] = [
            {
                "text": f"Starting at {start_label}.",
                "distance": 0,
                "direction": "straight",
                "landmark": start_label,
            }
        ]

        if len(path) == 1:
            steps.append(
                {
                    "text": f"You are already at {start_label}.",
                    "distance": 0,
                    "direction": "arrived",
                    "landmark": start_label,
                }
            )
            return steps

        for index in range(len(path) - 1):
            source, target = path[index], path[index + 1]
            target_label = labels.get(target, target)
            leg = graph.get(source, {}).get(target, 0.0)

            text = directions.get((source, target))
            if text is None:
                reverse = directions.get((target, source))
                # A reverse-only instruction describes the opposite walk, so it
                # cannot be reused verbatim; fall back to a generated line.
                text = (
                    f"Continue to {target_label}."
                    if reverse
                    else f"Walk {self._round(leg)} metres to {target_label}."
                )

            steps.append(
                {
                    "text": text,
                    "distance": self._round(leg),
                    "direction": self._infer_direction(text),
                    "landmark": target_label,
                }
            )

        end_label = labels.get(path[-1], path[-1])
        steps.append(
            {
                "text": f"You have arrived at {end_label}.",
                "distance": 0,
                "direction": "arrived",
                "landmark": end_label,
            }
        )
        return steps

    @staticmethod
    def _infer_direction(text: str) -> str:
        lowered = text.lower()
        if "left" in lowered:
            return "left"
        if "right" in lowered:
            return "right"
        if "upstairs" in lowered or "up to" in lowered:
            return "up"
        if "downstairs" in lowered or "down to" in lowered:
            return "down"
        return "straight"

    @staticmethod
    def _round(value: float) -> float:
        return round(float(value), 2)

    def route(self, start_node: str, end_node: str) -> dict:
        """Full route payload: path, distance, walking time, and instructions."""
        graph = self.load_graph()

        if start_node not in graph:
            raise NavigationError(f'"{start_node}" is not on the navigation map')
        if end_node not in graph:
            raise NavigationError(f'"{end_node}" is not on the navigation map')

        path, distance = self.shortest_path(start_node, end_node)
        labels = self._node_labels(path)
        instructions = self.build_instructions(path, graph)

        return {
            "path": path,
            "pathLabels": [labels.get(node_id, node_id) for node_id in path],
            "distance": self._round(distance),
            "estimatedTime": int(round(distance / WALKING_SPEED_MPS)) if distance else 0,
            "instructions": instructions,
            "spokenInstructions": [step["text"] for step in instructions],
            "start": {"nodeId": path[0], "name": labels.get(path[0], path[0])},
            "end": {"nodeId": path[-1], "name": labels.get(path[-1], path[-1])},
        }

    # ---------- place queries ----------

    def buildings(self) -> list[Building]:
        return (
            self.db.query(Building)
            .options(
                joinedload(Building.floors)
                .joinedload(Floor.locations)
                .joinedload(Location.location_type)
            )
            .filter(Building.status == STATUS_ACTIVE)
            .order_by(Building.building_name)
            .all()
        )

    def destinations(self, query: Optional[str] = None) -> list[Location]:
        stmt = (
            self.db.query(Location)
            .join(Location.location_type)
            .join(Location.floor)
            .join(Floor.building)
            .options(
                joinedload(Location.location_type),
                joinedload(Location.floor).joinedload(Floor.building),
            )
            .filter(Location.is_searchable.is_(True))
            .filter(Location.status == STATUS_ACTIVE)
        )

        if query and query.strip():
            like = f"%{query.strip()}%"
            stmt = stmt.filter(
                Location.location_name.ilike(like)
                | Location.display_name.ilike(like)
                | Building.building_name.ilike(like)
                | LocationType.location_type.ilike(like)
            )

        return stmt.order_by(Location.location_name).all()
