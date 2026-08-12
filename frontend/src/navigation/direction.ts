import { Direction } from "./types";

export const directions: Direction[] = [
  // ---- Top corridor ----
  {
    from: "Top_Corner_Left",
    to: "Seminar_Hall",
    instruction: "Walk straight. Seminar Hall is ahead.",
  },
  {
    from: "Seminar_Hall",
    to: "Top_Corner_Left",
    instruction: "Walk straight to the north corridor.",
  },
  {
    from: "Top_Corner_Left",
    to: "BS19_J",
    instruction: "Walk straight along the north corridor.",
  },
  {
    from: "BS19_J",
    to: "BS19",
    instruction: "BS-19 is on your left.",
  },
  {
    from: "BS19_J",
    to: "BS18_J",
    instruction: "Continue straight to the next corridor.",
  },
  {
    from: "BS18_J",
    to: "BS18",
    instruction: "BS-18 is ahead.",
  },
  {
    from: "BS18_J",
    to: "BS17D_J",
    instruction: "Continue straight along the north corridor.",
  },
  {
    from: "BS17D_J",
    to: "BS17D",
    instruction: "BS-17D is on your left.",
  },
  {
    from: "BS17D_J",
    to: "BS17C_J",
    instruction: "Continue straight to the next room.",
  },
  {
    from: "BS17C_J",
    to: "BS17C",
    instruction: "BS-17C is on your left.",
  },
  {
    from: "BS17C_J",
    to: "BS17B_J",
    instruction: "Continue straight to the next room.",
  },
  {
    from: "BS17B_J",
    to: "BS17B",
    instruction: "BS-17B is on your left.",
  },
  {
    from: "BS17B_J",
    to: "BS17A_J",
    instruction: "Continue straight to the next room.",
  },
  {
    from: "BS17A_J",
    to: "BS17A",
    instruction: "BS-17A is on your left.",
  },
  {
    from: "BS17A_J",
    to: "Top_Corner_Right",
    instruction: "Walk straight to the end of the corridor.",
  },
  {
    from: "Top_Corner_Right",
    to: "Right_Mid",
    instruction: "Turn right and walk down the corridor.",
  },

  // ---- Left side (top to mid corridor) ----
  {
    from: "Top_Corner_Left",
    to: "Left_Mid",
    instruction: "Turn left and head towards the lift and stair area.",
  },
  {
    from: "Left_Mid",
    to: "Lift",
    instruction: "The Lift is here on your left.",
  },
  {
    from: "Left_Mid",
    to: "BS16",
    instruction: "Walk straight. BS-16 is ahead.",
  },
  {
    from: "Left_Mid",
    to: "Stair",
    instruction: "Walk straight to the Stair area.",
  },
  {
    from: "Stair",
    to: "BS15",
    instruction: "BS-15 is on your left.",
  },
  {
    from: "Stair",
    to: "Water_Dispenser",
    instruction: "Walk straight to the Water Dispenser.",
  },
  {
    from: "Water_Dispenser",
    to: "BS14",
    instruction: "BS-14 is on your left.",
  },
  {
    from: "Water_Dispenser",
    to: "Mid_400",
    instruction: "Continue straight along the mid corridor.",
  },
  {
    from: "Mid_400",
    to: "BS10",
    instruction: "BS-10 is on your left.",
  },
  {
    from: "Mid_400",
    to: "Mid_500",
    instruction: "Continue straight along the mid corridor.",
  },
  {
    from: "Mid_500",
    to: "BS09",
    instruction: "BS-09 is on your left.",
  },
  {
    from: "Mid_500",
    to: "Mid_600",
    instruction: "Continue straight along the mid corridor.",
  },
  {
    from: "Mid_600",
    to: "BS08",
    instruction: "BS-08 is on your left.",
  },
  {
    from: "Mid_600",
    to: "Mid_700",
    instruction: "Continue straight along the mid corridor.",
  },
  {
    from: "Mid_700",
    to: "Girls_Sick_Room",
    instruction: "The Girls Sick Room is on your left.",
  },
  {
    from: "Mid_700",
    to: "Mid_800",
    instruction: "Continue straight along the mid corridor.",
  },
  {
    from: "Mid_800",
    to: "Toilet_Top",
    instruction: "The Toilet is on your left.",
  },
  {
    from: "Mid_800",
    to: "Right_Mid",
    instruction: "Continue straight to the end of the corridor.",
  },
  {
    from: "Right_Mid",
    to: "Top_Corner_Right",
    instruction: "Turn right and head to the north corridor.",
  },
  {
    from: "Right_Mid",
    to: "Right_Bottom",
    instruction: "Turn left and walk down to the bottom corridor.",
  },

  // ---- Left vertical (mid -> bottom) ----
  {
    from: "Left_Mid",
    to: "Left_Bottom",
    instruction: "Walk straight down to the bottom corridor.",
  },
  {
    from: "Left_Bottom",
    to: "Bottom_150",
    instruction: "Walk straight to the next room.",
  },
  {
    from: "Bottom_150",
    to: "BS07",
    instruction: "BS-07 is ahead.",
  },
  {
    from: "Bottom_150",
    to: "Faculty_Room",
    instruction: "Turn left. The Faculty Room is ahead.",
  },
  {
    from: "Bottom_150",
    to: "Bottom_250",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_250",
    to: "BS06",
    instruction: "BS-06 is ahead.",
  },
  {
    from: "Bottom_250",
    to: "DS_Faculty_Room",
    instruction: "Turn left. The DS Faculty Room is ahead.",
  },
  {
    from: "Bottom_250",
    to: "Bottom_350",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_350",
    to: "BS05",
    instruction: "BS-05 is ahead.",
  },
  {
    from: "Bottom_350",
    to: "AI_Faculty_Room",
    instruction: "Turn left. The AI Faculty Room is ahead.",
  },
  {
    from: "Bottom_350",
    to: "Bottom_450",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_450",
    to: "BS04",
    instruction: "BS-04 is ahead.",
  },
  {
    from: "Bottom_450",
    to: "Meeting_Room",
    instruction: "Turn left. The Meeting Room is ahead.",
  },
  {
    from: "Bottom_450",
    to: "Bottom_550",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_550",
    to: "BS03",
    instruction: "BS-03 is ahead.",
  },
  {
    from: "Bottom_550",
    to: "Cyber_Security",
    instruction: "Turn left. The Cyber Security room is ahead.",
  },
  {
    from: "Bottom_550",
    to: "Bottom_600",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_600",
    to: "Bottom_700",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_700",
    to: "Bottom_800",
    instruction: "Continue straight along the bottom corridor.",
  },
  {
    from: "Bottom_800",
    to: "Right_Bottom",
    instruction: "Walk straight to the end of the corridor.",
  },
  {
    from: "Right_Bottom",
    to: "Right_Mid",
    instruction: "Turn right and walk up the corridor.",
  },

  // ---- South rooms ----
  {
    from: "Faculty_Room",
    to: "Bottom_150",
    instruction: "Walk straight to the bottom corridor.",
  },
  {
    from: "DS_Faculty_Room",
    to: "Bottom_250",
    instruction: "Walk straight to the bottom corridor.",
  },
  {
    from: "AI_Faculty_Room",
    to: "Bottom_350",
    instruction: "Walk straight to the bottom corridor.",
  },
  {
    from: "Meeting_Room",
    to: "Bottom_450",
    instruction: "Walk straight to the bottom corridor.",
  },
  {
    from: "Cyber_Security",
    to: "Bottom_550",
    instruction: "Walk straight to the bottom corridor.",
  },
];
