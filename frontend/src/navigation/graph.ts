import { Graph } from "./types";

export const graph: Graph = {
  // ---- Top row rooms ----
  Seminar_Hall: {
    Top_Corner_Left: 2,
  },

  BS19: {
    BS19_J: 2,
  },

  BS18: {
    BS18_J: 2,
  },

  BS17D: {
    BS17D_J: 2,
  },

  BS17C: {
    BS17C_J: 2,
  },

  BS17B: {
    BS17B_J: 2,
  },

  BS17A: {
    BS17A_J: 2,
  },

  // ---- Top corridor junctions ----
  Top_Corner_Left: {
    Seminar_Hall: 2,
    BS19_J: 3,
    Left_Mid: 4,
  },

  BS19_J: {
    Top_Corner_Left: 3,
    BS19: 2,
    BS18_J: 2,
  },

  BS18_J: {
    BS19_J: 2,
    BS18: 2,
    BS17D_J: 2,
  },

  BS17D_J: {
    BS18_J: 2,
    BS17D: 2,
    BS17C_J: 2,
  },

  BS17C_J: {
    BS17D_J: 2,
    BS17C: 2,
    BS17B_J: 2,
  },

  BS17B_J: {
    BS17C_J: 2,
    BS17B: 2,
    BS17A_J: 2,
  },

  BS17A_J: {
    BS17B_J: 2,
    BS17A: 2,
    Top_Corner_Right: 2,
  },

  Top_Corner_Right: {
    BS17A_J: 2,
    Right_Mid: 4,
  },

  // ---- Mid-north rooms ----
  BS16: {
    Left_Mid: 2,
  },

  BS15: {
    Stair: 2,
  },

  BS14: {
    Water_Dispenser: 2,
  },

  BS10: {
    Mid_400: 2,
  },

  BS09: {
    Mid_500: 2,
  },

  BS08: {
    Mid_600: 2,
  },

  Girls_Sick_Room: {
    Mid_700: 2,
  },

  Toilet_Top: {
    Mid_800: 2,
  },

  // ---- Mid corridor junctions + facilities ----
  Left_Mid: {
    Top_Corner_Left: 4,
    Lift: 1,
    BS16: 2,
    Stair: 2,
    Left_Bottom: 4,
  },

  Lift: {
    Left_Mid: 1,
  },

  Stair: {
    Left_Mid: 2,
    BS15: 2,
    Water_Dispenser: 2,
  },

  Water_Dispenser: {
    Stair: 2,
    BS14: 2,
    Mid_400: 2,
  },

  Mid_400: {
    Water_Dispenser: 2,
    BS10: 2,
    Mid_500: 2,
  },

  Mid_500: {
    Mid_400: 2,
    BS09: 2,
    Mid_600: 2,
  },

  Mid_600: {
    Mid_500: 2,
    BS08: 2,
    Mid_700: 2,
  },

  Mid_700: {
    Mid_600: 2,
    Girls_Sick_Room: 2,
    Mid_800: 2,
  },

  Mid_800: {
    Mid_700: 2,
    Toilet_Top: 2,
    Right_Mid: 2,
  },

  Right_Mid: {
    Mid_800: 2,
    Top_Corner_Right: 4,
    Right_Bottom: 4,
  },

  // ---- Bottom room nodes (on bottom corridor) ----
  BS07: {
    Bottom_150: 1,
  },

  BS06: {
    Bottom_250: 1,
  },

  BS05: {
    Bottom_350: 1,
  },

  BS04: {
    Bottom_450: 1,
  },

  BS03: {
    Bottom_550: 1,
  },

  // ---- Bottom corridor junctions ----
  Left_Bottom: {
    Left_Mid: 4,
    Bottom_150: 2,
  },

  Bottom_150: {
    Left_Bottom: 2,
    BS07: 1,
    Faculty_Room: 3,
    Bottom_250: 2,
  },

  Bottom_250: {
    Bottom_150: 2,
    BS06: 1,
    DS_Faculty_Room: 3,
    Bottom_350: 2,
  },

  Bottom_350: {
    Bottom_250: 2,
    BS05: 1,
    AI_Faculty_Room: 3,
    Bottom_450: 2,
  },

  Bottom_450: {
    Bottom_350: 2,
    BS04: 1,
    Meeting_Room: 3,
    Bottom_550: 2,
  },

  Bottom_550: {
    Bottom_450: 2,
    BS03: 1,
    Cyber_Security: 3,
    Bottom_600: 2,
  },

  Bottom_600: {
    Bottom_550: 2,
    Bottom_700: 2,
  },

  Bottom_700: {
    Bottom_600: 2,
    Bottom_800: 2,
  },

  Bottom_800: {
    Bottom_700: 2,
    Right_Bottom: 2,
  },

  Right_Bottom: {
    Bottom_800: 2,
    Right_Mid: 4,
  },

  // ---- South row rooms ----
  Faculty_Room: {
    Bottom_150: 3,
  },

  DS_Faculty_Room: {
    Bottom_250: 3,
  },

  AI_Faculty_Room: {
    Bottom_350: 3,
  },

  Meeting_Room: {
    Bottom_450: 3,
  },

  Cyber_Security: {
    Bottom_550: 3,
  },
};
