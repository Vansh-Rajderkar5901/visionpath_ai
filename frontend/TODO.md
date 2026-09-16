# VisionPath AI - Indoor Map Rebuild (Block B Second Floor)

## Steps
- [x] Analyze existing codebase (indoorMapData, graph, direction, IndoorMap, page)
- [x] Confirm room list + naming with user
- [x] Confirm layout + plan with user
- [x] Rewrite `indoorMapData.ts` (10x10 grid, 28 rooms, positions, corridors, labels)
- [x] Rebuild `graph.ts` (connect all 28 rooms + junctions)
- [x] Update `direction.ts` (turn-by-turn instructions for new edges)
- [x] Update `IndoorMap.tsx` (grid-cols-10 grid-rows-10)
- [x] Update `services/navigation.ts` (destinations + building rooms/facilities to match new map)
- [x] Update `indoor/page.tsx` (default current location -> 'Lift')
- [x] Verify build (no TS errors in changed files; remaining errors are only pre-existing voice/profile files)

## Room List (28)
- BS-numbered (17): BS-03, BS-04, BS-05, BS-06, BS-07, BS-08, BS-09, BS-10, BS-14, BS-15, BS-16, BS-17A, BS-17B, BS-17C, BS-17D, BS-18, BS-19
- Special (11): Seminar Hall, Faculty Room, DS Faculty Room, AI Faculty Room, Meeting Room, Cyber Security, Girls Sick Room, Toilet, Lift, Stair, Water Dispenser
