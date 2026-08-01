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
          "BS-18A",
          "BS-18B",
          "BS-17A",
          "BS-17B",
          "BS-17C",
          "BS-17D",
          "Faculty Room",
          "Meeting Room",
          "BS-05",
          "BS-07"
        ],
        facilities: [
          {
            id: "lift",
            name: "Lift Area",
            type: "elevator",
            coordinates: { x: 500, y: 300, floor: 2 }
          },
          {
            id: "stairs",
            name: "Stair Area",
            type: "stairs",
            coordinates: { x: 550, y: 300, floor: 2 }
          },
          {
            id: "water",
            name: "Water Dispenser",
            type: "water",
            coordinates: { x: 600, y: 300, floor: 2 }
          },
          {
            id: "toilet",
            name: "Toilet",
            type: "washroom",
            coordinates: { x: 750, y: 520, floor: 2 }
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
    coordinates: { x: 100, y: 100, floor: 2 },
    type: "room",
  },
  {
    id: "2",
    name: "BS19",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 120, y: 120, floor: 2 },
    type: "room",
  },
  {
    id: "3",
    name: "BS18A",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 140, y: 140, floor: 2 },
    type: "room",
  },
  {
    id: "4",
    name: "BS18B",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 160, y: 160, floor: 2 },
    type: "room",
  },
  {
    id: "5",
    name: "BS17A",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 180, y: 180, floor: 2 },
    type: "room",
  },
  {
    id: "6",
    name: "BS17B",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 200, y: 200, floor: 2 },
    type: "room",
  },
  {
    id: "7",
    name: "BS17C",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 220, y: 220, floor: 2 },
    type: "room",
  },
  {
    id: "8",
    name: "BS17D",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 240, y: 240, floor: 2 },
    type: "room",
  },
  {
    id: "9",
    name: "Faculty_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 260, y: 260, floor: 2 },
    type: "office",
  },
  {
    id: "10",
    name: "Meeting_Room",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 280, y: 280, floor: 2 },
    type: "office",
  },
  {
    id: "11",
    name: "BS05",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 300, y: 300, floor: 2 },
    type: "room",
  },
  {
    id: "12",
    name: "BS07",
    building: "CSE Block",
    floor: "Second Floor",
    coordinates: { x: 320, y: 320, floor: 2 },
    type: "room",
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

