console.log("******** USING NEW navigation.ts ********");
import { Building, Floor, NavigationDestination, Facility } from '@/types';

const mockBuildings: Building[] = [
  {
    id: "cse-block",
    name: "CSE Block",
    code: "CSE",
    latitude: 21.1458,
    longitude: 79.0882,
    floors: [
      {
        id: "floor-2",
        name: "Second Floor",
        level: 2,
rooms: [
          "Seminar Hall",
          "BS-19",
          "BS-18",
          "BS-17D",
          "BS-17C",
          "BS-17B",
          "BS-17A",
          "BS-16",
          "BS-15",
          "BS-14",
          "BS-10",
          "BS-09",
          "BS-08",
          "Girls Sick Room",
          "Toilet",
          "BS-07",
          "BS-06",
          "BS-05",
          "BS-04",
          "BS-03",
          "Faculty Room",
          "DS Faculty Room",
          "AI Faculty Room",
          "Meeting Room",
          "Cyber Security"
        ],
        facilities: [
          {
            id: "lift",
            name: "Lift",
            type: "elevator",
            coordinates: { x: 100, y: 252, floor: 2 }
          },
          {
            id: "stairs",
            name: "Stair",
            type: "stairs",
            coordinates: { x: 200, y: 252, floor: 2 }
          },
          {
            id: "water",
            name: "Water Dispenser",
            type: "water",
            coordinates: { x: 300, y: 252, floor: 2 }
          },
          {
            id: "sick",
            name: "Girls Sick Room",
            type: "medical",
            coordinates: { x: 700, y: 190, floor: 2 }
          },
          {
            id: "toilet",
            name: "Toilet",
            type: "washroom",
            coordinates: { x: 800, y: 190, floor: 2 }
          }
        ]
      }
    ]
  }
];

const mockDestinations: NavigationDestination[] = [
  {
    id: "1",
    name: "Seminar_Hall",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 100, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "2",
    name: "BS19",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 250, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "3",
    name: "BS18",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 350, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "4",
    name: "BS17D",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 450, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "5",
    name: "BS17C",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 550, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "6",
    name: "BS17B",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 650, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "7",
    name: "BS17A",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 750, y: 45, floor: 2 },
    type: "room",
  },
  {
    id: "8",
    name: "Faculty_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 150, y: 540, floor: 2 },
    type: "office",
  },
  {
    id: "9",
    name: "DS_Faculty_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 250, y: 540, floor: 2 },
    type: "office",
  },
  {
    id: "10",
    name: "AI_Faculty_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 350, y: 540, floor: 2 },
    type: "office",
  },
  {
    id: "11",
    name: "Meeting_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 450, y: 540, floor: 2 },
    type: "office",
  },
  {
    id: "12",
    name: "Cyber_Security",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 550, y: 540, floor: 2 },
    type: "room",
  },
  {
    id: "13",
    name: "BS16",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 100, y: 190, floor: 2 },
    type: "room",
  },
  {
    id: "14",
    name: "BS15",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 200, y: 190, floor: 2 },
    type: "room",
  },
  {
    id: "15",
    name: "BS14",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 300, y: 190, floor: 2 },
    type: "room",
  },
  {
    id: "16",
    name: "BS10",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 400, y: 190, floor: 2 },
    type: "room",
  },
  {
    id: "17",
    name: "BS09",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 500, y: 190, floor: 2 },
    type: "room",
  },
  {
    id: "18",
    name: "BS08",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 600, y: 190, floor: 2 },
    type: "room",
  },
  {
    id: "19",
    name: "Girls_Sick_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 700, y: 190, floor: 2 },
    type: "facility",
  },
  {
    id: "20",
    name: "Toilet_Top",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 800, y: 190, floor: 2 },
    type: "facility",
  },
  {
    id: "21",
    name: "BS07",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 150, y: 396, floor: 2 },
    type: "room",
  },
  {
    id: "22",
    name: "BS06",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 250, y: 396, floor: 2 },
    type: "room",
  },
  {
    id: "23",
    name: "BS05",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 350, y: 396, floor: 2 },
    type: "room",
  },
  {
    id: "24",
    name: "BS04",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 450, y: 396, floor: 2 },
    type: "room",
  },
  {
    id: "25",
    name: "BS03",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 550, y: 396, floor: 2 },
    type: "room",
  },
  {
    id: "26",
    name: "Lift",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 100, y: 252, floor: 2 },
    type: "facility",
  },
  {
    id: "27",
    name: "Stair",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 200, y: 252, floor: 2 },
    type: "facility",
  },
  {
    id: "28",
    name: "Water_Dispenser",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 300, y: 252, floor: 2 },
    type: "facility",
  },
];
export const navigationService = {
  async getBuildings(): Promise<Building[]> {
  console.log("******** USING NEW navigation.ts ********");
  console.log(mockBuildings);

  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockBuildings;
},

  async getBuilding(buildingId: string): Promise<Building | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockBuildings.find((b) => b.id === buildingId);
  },

  async getFloors(buildingId: string): Promise<Floor[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const building = mockBuildings.find((b) => b.id === buildingId);
    return building?.floors || [];
  },

 async getDestinations(): Promise<NavigationDestination[]> {
  console.log("===== DESTINATIONS =====");
  console.log(mockDestinations);

  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockDestinations;
},

  async searchDestinations(query: string): Promise<NavigationDestination[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const q = query.toLowerCase();
    return mockDestinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.building.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
    );
  },

  async getFacilities(buildingId: string, floorLevel: number): Promise<Facility[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const building = mockBuildings.find((b) => b.id === buildingId);
    const floor = building?.floors.find((f) => f.level === floorLevel);
    return floor?.facilities || [];
  },

  async getNearbyWashrooms(buildingId: string, floorLevel: number): Promise<Facility[]> {
    const facilities = await this.getFacilities(buildingId, floorLevel);
    return facilities.filter((f) => f.type === 'washroom');
  },

  async getNearbyMedicalFacilities(): Promise<Facility[]> {
    const allFacilities: Facility[] = [];
    mockBuildings.forEach((building) => {
      building.floors.forEach((floor) => {
        floor.facilities.forEach((facility) => {
          if (facility.type === 'medical') {
            allFacilities.push(facility);
          }
        });
      });
    });
    return allFacilities;
  },
};

