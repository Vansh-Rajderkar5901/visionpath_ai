import { Graph } from "./types";

export const graph: Graph = {

  Seminar_Hall: {
    Seminar_Junction: 2,
  },

  Seminar_Junction: {
    Seminar_Hall: 2,
    North_Corridor: 4,
  },

  North_Corridor: {
    Seminar_Junction: 4,
    BS19: 3,
    BS18_Corridor: 5,
  },

  BS19: {
    North_Corridor: 3,
  },

  BS18_Corridor: {
    North_Corridor: 5,
    BS18A: 2,
    BS18B: 2,
    BS17_Corridor: 6,
  },

  BS18A: {
    BS18_Corridor: 2,
  },

  BS18B: {
    BS18_Corridor: 2,
  },

  BS17_Corridor: {
    BS18_Corridor: 6,
    BS17A: 2,
    BS17B: 2,
    BS17C: 2,
    BS17D: 3,
    Courtyard_Junction: 8,
  },

  BS17A: {
    BS17_Corridor: 2,
  },

  BS17B: {
    BS17_Corridor: 2,
  },

  BS17C: {
    BS17_Corridor: 2,
  },

  BS17D: {
    BS17_Corridor: 3,
  },

  Courtyard_Junction: {
    BS17_Corridor: 8,
    Lift_Stair_Junction: 6,
  },

  Lift_Stair_Junction: {
    Courtyard_Junction: 6,
    Lift_Area: 2,
    Stair_Area: 2,
    Water_Dispenser: 1,
    Faculty_Junction: 5,
  },

  Lift_Area: {
    Lift_Stair_Junction: 2,
  },

  Stair_Area: {
    Lift_Stair_Junction: 2,
  },

  Water_Dispenser: {
    Lift_Stair_Junction: 1,
  },

  Faculty_Junction: {
    Lift_Stair_Junction: 5,
    Faculty_Room: 2,
    Meeting_Room: 3,
    Classroom_Junction: 6,
  },

  Faculty_Room: {
    Faculty_Junction: 2,
  },

  Meeting_Room: {
    Faculty_Junction: 3,
  },

  Classroom_Junction: {
    Faculty_Junction: 6,
    BS05: 2,
    BS07: 2,
    Toilet: 2,
  },

  BS05: {
    Classroom_Junction: 2,
  },

  BS07: {
    Classroom_Junction: 2,
  },

  Toilet: {
    Classroom_Junction: 2,
  },
};