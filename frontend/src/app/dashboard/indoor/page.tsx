'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Navigation,
  MapPin,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Search,
  ChevronRight,
  Layers,
  Loader2,
  Footprints,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { navigationService } from '@/services/navigation';
import { cn } from '@/lib/utils';
import type { Building, Floor, NavigationDestination, Facility } from '@/types';
import { navigate } from "@/navigation/navigationService";

export default function IndoorNavigationPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<NavigationDestination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFacilities, setShowFacilities] = useState(false);

  const [currentLocation, setCurrentLocation] = useState("Lift_Area");

  const [route, setRoute] = useState<string[]>([]);

  const [instructions, setInstructions] = useState<string[]>([]);

  const [totalDistance, setTotalDistance] = useState(0);
  console.log("Indoor Navigation Page Rendered");

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: navigationService.getBuildings,
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: navigationService.getDestinations,
  });

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(building.floors[0] || null);
    setSelectedDestination(null);
  };

  const handleNavigate = () => {

  if (!selectedDestination) return;

  const result = navigate(
    currentLocation,
    selectedDestination.name
  );

  setRoute(result.path);

  setInstructions(result.instructions);

  setTotalDistance(result.distance);

  console.log(result);

};

  const filteredDestinations = destinations?.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
<h1 className="text-4xl font-bold text-red-500">
  TEST PAGE - RUCHIRA
</h1>        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Navigate buildings, floors, and rooms with precision
        </p>
      </motion.div>
      {/* Navigation Result */}
{route.length > 0 && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-4"
  >
    <h3 className="text-lg font-semibold mb-3">
      Navigation Result
    </h3>

    <p className="mb-3">
      <strong>Total Distance:</strong> {totalDistance} meters
    </p>

    <h4 className="font-semibold mb-2">
      Shortest Path
    </h4>

    <ul className="list-disc ml-6 mb-4">
      {route.map((node) => (
        <li key={node}>{node}</li>
      ))}
    </ul>

    <h4 className="font-semibold mb-2">
      Voice Instructions
    </h4>

    <ul className="list-disc ml-6">
      {instructions.map((instruction, index) => (
        <li key={index}>{instruction}</li>
      ))}
    </ul>
  </motion.div>
)}

      {/* Step Progress */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { label: 'Building', active: !!selectedBuilding },
          { label: 'Floor', active: !!selectedFloor },
          { label: 'Destination', active: !!selectedDestination },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full font-medium',
              step.active
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-dark-border text-gray-400'
            )}>
              {step.active ? <Navigation className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {step.label}
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Building & Floor Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
              placeholder="Search destinations..."
              aria-label="Search destinations"
            />
          </div>

          {/* Buildings List */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-500" />
                Buildings
              </h3>
              <span className="text-xs text-gray-400">{buildings?.length || 0}</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-[400px] overflow-y-auto">
              {buildings?.map((building) => (
                <button
                  key={building.id}
                  onClick={() => handleBuildingSelect(building)}
                  className={cn(
                    'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
                    selectedBuilding?.id === building.id && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <p className="font-medium text-sm">{building.name}</p>
                  <p className="text-xs text-gray-500">{building.floors.length} floors</p>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Selection */}
          {selectedBuilding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-3"
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-500" />
                Select Floor
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedBuilding.floors.map((floor) => (
                  <button
                    key={floor.id}
                    onClick={() => setSelectedFloor(floor)}
                    className={cn(
                      'px-4 py-2 rounded-xl text-sm font-medium transition-colors border',
                      selectedFloor?.id === floor.id
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-gray-100 dark:bg-dark-border border-gray-200 dark:border-dark-border hover:bg-gray-200 dark:hover:bg-dark-card'
                    )}
                  >
                    {floor.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Floor Facilities */}
          {selectedFloor && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-3"
            >
              <button
                onClick={() => setShowFacilities(!showFacilities)}
                className="w-full flex items-center justify-between text-sm font-semibold"
              >
                <span>Facilities on {selectedFloor.name}</span>
                <ChevronRight className={cn(
                  'w-4 h-4 transition-transform',
                  showFacilities && 'rotate-90'
                )} />
              </button>
              {showFacilities && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="mt-3 space-y-1 overflow-hidden"
                >
                  {selectedFloor.facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      {facility.name}
                      <span className="text-xs text-gray-400 ml-auto capitalize">{facility.type}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Panel - Map & Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Indoor Map Placeholder */}
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-border dark:to-dark-card border border-gray-200 dark:border-dark-border relative overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0v40M0 20h40\' stroke=\'%236366f1\' stroke-width=\'0.5\'/%3E%3C/svg%3E")',
            }} />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-dark-card shadow-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-primary-500" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">
                  {selectedBuilding ? `${selectedBuilding.name} - ${selectedFloor?.name || 'Select floor'}` : 'Select a building'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedDestination
                    ? `Destination: ${selectedDestination.name}`
                    : 'Indoor map will be displayed here'}
                </p>
                {!selectedBuilding && (
                  <p className="text-xs text-gray-400 mt-2">
                    Google Indoor Maps / OpenStreetMap / BLE / QR / NFC ready
                  </p>
                )}
              </div>
            </div>

            {/* Room Labels */}
            {selectedFloor && (
              <div className="absolute top-4 left-4 space-y-2">
                {selectedFloor.rooms.map((room) => (
  <button
    key={room}
    onClick={() => {
      const dest = destinations?.find(
        (d) => d.name === room.replace("-", "")
      );

      if (dest) {
        setSelectedDestination(dest);
      }
    }}
    className={cn(
      "block px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium transition-colors",
      selectedDestination?.name === room.replace("-", "")
        ? "bg-primary-500 text-white"
        : "bg-white/90 dark:bg-dark-card/90 hover:bg-primary-50"
    )}
  >
    {room}
  </button>
))}
              </div>
            )}
          </div>

          {/* Destination Selection & Navigation */}
          {searchQuery && filteredDestinations && filteredDestinations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border divide-y divide-gray-200 dark:divide-dark-border"
            >
              <div className="p-3 border-b border-gray-200 dark:border-dark-border">
                <h3 className="text-sm font-semibold">Search Results</h3>
              </div>
              {filteredDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest)}
                  className={cn(
                    'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
                    selectedDestination?.id === dest.id && 'bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <p className="font-medium text-sm">{dest.name}</p>
                  <p className="text-xs text-gray-500">{dest.building} - {dest.floor}</p>
                </button>
              ))}
            </motion.div>
          )}

          {/* Navigate Button */}
          {selectedDestination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{selectedDestination.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDestination.building} - {selectedDestination.floor}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Footprints className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-medium text-primary-600">2 min</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNavigate}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Start Navigation
                </button>
                <button className="btn-secondary">
                  Directions
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

