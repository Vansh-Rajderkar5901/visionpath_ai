// ============================================
// Indoor Map Data - Block B Second Floor
// --------------------------------------------
// Defines the floor-plan coordinate system, the
// selectable rooms (placed with CSS Grid) and the
// corridor network + graph node positions used by
// the SVG route overlay.
//
// The map uses a 10 (columns) x 10 (rows) CSS Grid
// rendered at a 1000 x 720 aspect ratio. The SVG
// overlay uses the SAME 1000 x 720 viewBox so the
// route path and current-location dot line up
// exactly with the room cards.
// ============================================

export const MAP_VIEWBOX = { width: 1000, height: 720 };

// Grid cell centers (for reference):
//   cols: 50,150,250,... | rows: 36,108,180,252,324,396,468,540,612,684
export interface NodePosition {
  x: number;
  y: number;
}

// Positions of every graph node (rooms + junctions).
// Junction nodes are corridor intersections used by
// Dijkstra but are not rendered as clickable room cards.
export const NODE_POSITIONS: Record<string, NodePosition> = {
  // ---- Top row rooms (row 1) ----
  Seminar_Hall: { x: 100, y: 45 },
  BS19: { x: 250, y: 45 },
  BS18: { x: 350, y: 45 },
  BS17D: { x: 450, y: 45 },
  BS17C: { x: 550, y: 45 },
  BS17B: { x: 650, y: 45 },
  BS17A: { x: 750, y: 45 },

  // ---- Top corridor junctions ----
  Top_Corner_Left: { x: 100, y: 135 },
  BS19_J: { x: 250, y: 135 },
  BS18_J: { x: 350, y: 135 },
  BS17D_J: { x: 450, y: 135 },
  BS17C_J: { x: 550, y: 135 },
  BS17B_J: { x: 650, y: 135 },
  BS17A_J: { x: 750, y: 135 },
  Top_Corner_Right: { x: 850, y: 135 },

  // ---- Mid-north rooms (row 3) ----
  BS16: { x: 100, y: 190 },
  BS15: { x: 200, y: 190 },
  BS14: { x: 300, y: 190 },
  BS10: { x: 400, y: 190 },
  BS09: { x: 500, y: 190 },
  BS08: { x: 600, y: 190 },
  Girls_Sick_Room: { x: 700, y: 190 },
  Toilet_Top: { x: 800, y: 190 },

  // ---- Mid corridor junctions + facilities (row 4) ----
  Left_Mid: { x: 100, y: 252 },
  Stair: { x: 200, y: 252 },
  Water_Dispenser: { x: 300, y: 252 },
  Mid_400: { x: 400, y: 252 },
  Mid_500: { x: 500, y: 252 },
  Mid_600: { x: 600, y: 252 },
  Mid_700: { x: 700, y: 252 },
  Mid_800: { x: 800, y: 252 },
  Right_Mid: { x: 850, y: 252 },

  // Lift shares the left-mid corner junction
  Lift: { x: 100, y: 252 },

  // ---- Bottom rooms (row 6, on bottom corridor) ----
  BS07: { x: 150, y: 396 },
  BS06: { x: 250, y: 396 },
  BS05: { x: 350, y: 396 },
  BS04: { x: 450, y: 396 },
  BS03: { x: 550, y: 396 },

  // ---- Bottom corridor junctions ----
  Left_Bottom: { x: 100, y: 396 },
  Bottom_150: { x: 150, y: 396 },
  Bottom_250: { x: 250, y: 396 },
  Bottom_350: { x: 350, y: 396 },
  Bottom_450: { x: 450, y: 396 },
  Bottom_550: { x: 550, y: 396 },
  Bottom_600: { x: 600, y: 396 },
  Bottom_700: { x: 700, y: 396 },
  Bottom_800: { x: 800, y: 396 },
  Right_Bottom: { x: 850, y: 396 },

  // ---- South row rooms (row 8) ----
  Faculty_Room: { x: 150, y: 540 },
  DS_Faculty_Room: { x: 250, y: 540 },
  AI_Faculty_Room: { x: 350, y: 540 },
  Meeting_Room: { x: 450, y: 540 },
  Cyber_Security: { x: 550, y: 540 },
};

export interface SelectableRoom {
  id: string;
  navNode: string; // graph node name (== destination.name)
  label: string; // display label on the card
  type: 'room' | 'facility' | 'office' | 'entrance';
  gridColumn: string;
  gridRow: string;
}

// Rooms are laid out with CSS Grid (column + row spans).
export const SELECTABLE_ROOMS: SelectableRoom[] = [
  // ---- Top row (row 1) ----
  { id: 'seminar', navNode: 'Seminar_Hall', label: 'Seminar Hall', type: 'room', gridColumn: '1 / 3', gridRow: '1 / 2' },
  { id: 'bs19', navNode: 'BS19', label: 'BS-19', type: 'room', gridColumn: '3 / 4', gridRow: '1 / 2' },
  { id: 'bs18', navNode: 'BS18', label: 'BS-18', type: 'room', gridColumn: '4 / 5', gridRow: '1 / 2' },
  { id: 'bs17d', navNode: 'BS17D', label: 'BS-17D', type: 'room', gridColumn: '5 / 6', gridRow: '1 / 2' },
  { id: 'bs17c', navNode: 'BS17C', label: 'BS-17C', type: 'room', gridColumn: '6 / 7', gridRow: '1 / 2' },
  { id: 'bs17b', navNode: 'BS17B', label: 'BS-17B', type: 'room', gridColumn: '7 / 8', gridRow: '1 / 2' },
  { id: 'bs17a', navNode: 'BS17A', label: 'BS-17A', type: 'room', gridColumn: '8 / 9', gridRow: '1 / 2' },

  // ---- Mid-north row (row 3) ----
  { id: 'bs16', navNode: 'BS16', label: 'BS-16', type: 'room', gridColumn: '1 / 2', gridRow: '3 / 4' },
  { id: 'bs15', navNode: 'BS15', label: 'BS-15', type: 'room', gridColumn: '2 / 3', gridRow: '3 / 4' },
  { id: 'bs14', navNode: 'BS14', label: 'BS-14', type: 'room', gridColumn: '3 / 4', gridRow: '3 / 4' },
  { id: 'bs10', navNode: 'BS10', label: 'BS-10', type: 'room', gridColumn: '4 / 5', gridRow: '3 / 4' },
  { id: 'bs09', navNode: 'BS09', label: 'BS-09', type: 'room', gridColumn: '5 / 6', gridRow: '3 / 4' },
  { id: 'bs08', navNode: 'BS08', label: 'BS-08', type: 'room', gridColumn: '6 / 7', gridRow: '3 / 4' },
  { id: 'sick', navNode: 'Girls_Sick_Room', label: 'Sick Room', type: 'facility', gridColumn: '7 / 8', gridRow: '3 / 4' },
  { id: 'toiletTop', navNode: 'Toilet_Top', label: 'Toilet', type: 'facility', gridColumn: '8 / 9', gridRow: '3 / 4' },

  // ---- Facilities (row 4) ----
  { id: 'lift', navNode: 'Lift', label: 'Lift', type: 'facility', gridColumn: '1 / 2', gridRow: '4 / 5' },
  { id: 'stair', navNode: 'Stair', label: 'Stair', type: 'facility', gridColumn: '2 / 3', gridRow: '4 / 5' },
  { id: 'water', navNode: 'Water_Dispenser', label: 'Water', type: 'facility', gridColumn: '3 / 4', gridRow: '4 / 5' },

  // ---- Bottom row (row 6) ----
  { id: 'bs07', navNode: 'BS07', label: 'BS-07', type: 'room', gridColumn: '1 / 2', gridRow: '6 / 7' },
  { id: 'bs06', navNode: 'BS06', label: 'BS-06', type: 'room', gridColumn: '2 / 3', gridRow: '6 / 7' },
  { id: 'bs05', navNode: 'BS05', label: 'BS-05', type: 'room', gridColumn: '3 / 4', gridRow: '6 / 7' },
  { id: 'bs04', navNode: 'BS04', label: 'BS-04', type: 'room', gridColumn: '4 / 5', gridRow: '6 / 7' },
  { id: 'bs03', navNode: 'BS03', label: 'BS-03', type: 'room', gridColumn: '5 / 6', gridRow: '6 / 7' },

  // ---- South row (row 8) ----
  { id: 'faculty', navNode: 'Faculty_Room', label: 'Faculty Room', type: 'office', gridColumn: '1 / 2', gridRow: '8 / 9' },
  { id: 'dsFaculty', navNode: 'DS_Faculty_Room', label: 'DS Faculty', type: 'office', gridColumn: '2 / 3', gridRow: '8 / 9' },
  { id: 'aiFaculty', navNode: 'AI_Faculty_Room', label: 'AI Faculty', type: 'office', gridColumn: '3 / 4', gridRow: '8 / 9' },
  { id: 'meeting', navNode: 'Meeting_Room', label: 'Meeting Room', type: 'office', gridColumn: '4 / 5', gridRow: '8 / 9' },
  { id: 'cyber', navNode: 'Cyber_Security', label: 'Cyber Sec', type: 'room', gridColumn: '5 / 6', gridRow: '8 / 9' },
];

// Corridor segments drawn on the floor plan (background).
export const CORRIDOR_LINES: Array<[number, number, number, number]> = [
  // Main corridors (rectangular loop)
  [100, 135, 850, 135], // top corridor
  [100, 135, 100, 252], // left vertical (top -> mid)
  [100, 252, 100, 396], // left vertical (mid -> bottom)
  [850, 135, 850, 252], // right vertical (top -> mid)
  [850, 252, 850, 396], // right vertical (mid -> bottom)
  [100, 252, 850, 252], // mid corridor
  [100, 396, 850, 396], // bottom corridor

  // Top room branches
  [100, 135, 100, 45], // seminar
  [250, 135, 250, 45], // bs19
  [350, 135, 350, 45], // bs18
  [450, 135, 450, 45], // bs17d
  [550, 135, 550, 45], // bs17c
  [650, 135, 650, 45], // bs17b
  [750, 135, 750, 45], // bs17a

  // Mid-north room branches
  [100, 252, 100, 190], // bs16
  [200, 252, 200, 190], // bs15
  [300, 252, 300, 190], // bs14
  [400, 252, 400, 190], // bs10
  [500, 252, 500, 190], // bs09
  [600, 252, 600, 190], // bs08
  [700, 252, 700, 190], // sick room
  [800, 252, 800, 190], // toilet

  // South room branches
  [150, 396, 150, 540], // faculty room
  [250, 396, 250, 540], // ds faculty
  [350, 396, 350, 540], // ai faculty
  [450, 396, 450, 540], // meeting room
  [550, 396, 550, 540], // cyber security
];

// Junction labels rendered subtly on the map.
export const JUNCTION_LABELS: Array<{ x: number; y: number; text: string }> = [
  { x: 475, y: 120, text: 'North Corridor' },
  { x: 475, y: 240, text: 'Mid Corridor' },
  { x: 850, y: 190, text: 'Corridor' },
  { x: 475, y: 385, text: 'Bottom Corridor' },
  { x: 100, y: 320, text: 'Left' },
  { x: 850, y: 320, text: 'Right' },
];
