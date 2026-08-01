import { Direction } from "./types";

export const directions: Direction[] = [
  {
    from: "Lift_Area",
    to: "Lift_Stair_Junction",
    instruction: "Walk straight to the Lift and Stair Junction.",
  },

  {
    from: "Lift_Stair_Junction",
    to: "Courtyard_Junction",
    instruction: "Walk straight towards the Courtyard.",
  },

  {
    from: "Courtyard_Junction",
    to: "BS17_Corridor",
    instruction: "Continue straight into the BS-17 Corridor.",
  },

  {
    from: "BS17_Corridor",
    to: "BS18_Corridor",
    instruction: "Walk straight until the BS-18 Corridor.",
  },

  {
    from: "BS18_Corridor",
    to: "BS18A",
    instruction: "Turn left. BS-18A is on your left.",
  },

  {
    from: "BS18_Corridor",
    to: "BS18B",
    instruction: "Turn right. BS-18B is on your right.",
  },

  {
    from: "Faculty_Junction",
    to: "Classroom_Junction",
    instruction: "Walk straight towards the classrooms.",
  },

  {
    from: "Classroom_Junction",
    to: "BS05",
    instruction: "Turn left. BS-05 is ahead.",
  },

  {
    from: "Classroom_Junction",
    to: "BS07",
    instruction: "Turn right. BS-07 is ahead.",
  },

  {
    from: "Classroom_Junction",
    to: "Toilet",
    instruction: "Walk straight. Toilet is ahead.",
  },

  {
  from: "Lift_Stair_Junction",
  to: "Faculty_Junction",
  instruction: "Walk straight towards the Faculty Junction.",
},

{
  from: "Faculty_Junction",
  to: "Faculty_Room",
  instruction: "Turn left. Faculty Room is ahead.",
},

{
  from: "Faculty_Junction",
  to: "Meeting_Room",
  instruction: "Turn right. Meeting Room is ahead.",
},

{
  from: "North_Corridor",
  to: "BS19",
  instruction: "BS-19 is on your left.",
},

{
  from: "Seminar_Junction",
  to: "Seminar_Hall",
  instruction: "Seminar Hall is straight ahead.",
},

{
  from: "BS17_Corridor",
  to: "BS17A",
  instruction: "BS-17A is on your left.",
},

{
  from: "BS17_Corridor",
  to: "BS17B",
  instruction: "BS-17B is next to BS-17A.",
},

{
  from: "BS17_Corridor",
  to: "BS17C",
  instruction: "Continue straight to BS-17C.",
},

{
  from: "BS17_Corridor",
  to: "BS17D",
  instruction: "BS-17D is at the end of the corridor.",
},
];