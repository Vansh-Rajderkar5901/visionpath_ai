'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  MapPin,
  ChevronRight,
  Footprints,
  Route,
  Locate,
  CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { navigationService } from '@/services/navigation';
import { cn } from '@/lib/utils';
import type { Building, Floor, NavigationDestination } from '@/types';
import { navigate } from '@/navigation/navigationService';
import { IndoorMap } from '@/components/navigation/IndoorMap';
import { SearchDropdown } from '@/components/navigation/SearchDropdown';
import { BuildingSelector } from '@/components/navigation/BuildingSelector';
import { FloorSelector } from '@/components/navigation/FloorSelector';
import { NODE_POSITIONS } from '@/components/navigation/indoorMapData';

export default function IndoorNavigationPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<NavigationDestination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

// Current location comes from a variable only (later: BLE/QR/NFC/WiFi/CV/manual).
  const [currentLocation, setCurrentLocation] = useState('Lift');

  const [route, setRoute] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: navigationService.getBuildings,
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: navigationService.getDestinations,
  });

  // ---------- Navigation ----------
  const handleNavigate = useCallback(() => {
    if (!selectedDestination) return;

    const result = navigate(currentLocation, selectedDestination.name);
    setRoute(result.path);
    setInstructions(result.instructions);
    setTotalDistance(result.distance);
  }, [currentLocation, selectedDestination]);

  // ---------- Voice module integration ----------
  // Expose controls so the voice teammate can call them without a refactor.
  const apiRef = useRef<{ setSelectedDestination: typeof setSelectedDestination; handleNavigate: typeof handleNavigate } | null>(null);
  apiRef.current = { setSelectedDestination, handleNavigate };

  useEffect(() => {
    // Expose functions globally (typed as any to stay simple).
    (window as unknown as Record<string, unknown>).__indoorNavigation = {
      setSelectedDestination: (dest: NavigationDestination) => apiRef.current?.setSelectedDestination(dest),
      handleNavigate: () => apiRef.current?.handleNavigate(),
    };

    // Listen for the existing voice 'navigate' event dispatched by VoiceContext.
    const onNavigateEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as { destination?: string } | undefined;
      const destName = detail?.destination;
      if (!destName) return;
      const match = destinations?.find(
        (d) => d.name.toLowerCase() === destName.toLowerCase()
      );
      if (match) {
        apiRef.current?.setSelectedDestination(match);
        // navigate after state settles
        setTimeout(() => apiRef.current?.handleNavigate(), 0);
      }
    };

    window.addEventListener('navigate', onNavigateEvent);
    return () => {
      window.removeEventListener('navigate', onNavigateEvent);
      delete (window as unknown as Record<string, unknown>).__indoorNavigation;
    };
  }, [destinations]);

  // ---------- Handlers ----------
  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(building.floors[0] || null);
    setSelectedDestination(null);
    setRoute([]);
    setInstructions([]);
    setTotalDistance(0);
  };

  const handleFloorSelect = (floor: Floor) => {
    setSelectedFloor(floor);
    setSelectedDestination(null);
    setRoute([]);
    setInstructions([]);
    setTotalDistance(0);
  };

  const handleDestinationSelect = (dest: NavigationDestination) => {
    setSelectedDestination(dest);
    setSearchQuery('');
    setRoute([]);
    setInstructions([]);
    setTotalDistance(0);
  };

  const handleRoomSelect = (node: string) => {
    const match = destinations?.find((d) => d.name === node);
    if (match) {
      setSelectedDestination(match);
    }
  };

  const destinationNode = selectedDestination?.name ?? null;
  const currentPos = NODE_POSITIONS[currentLocation];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl sm:text-4xl font-bold">Indoor Navigation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Navigate buildings, floors, and rooms with precision
        </p>
      </motion.div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {[
          { label: 'Building', active: !!selectedBuilding },
          { label: 'Floor', active: !!selectedFloor },
          { label: 'Destination', active: !!selectedDestination },
        ].map((step, i) => (
          <React.Fragment key={step.label}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full font-medium',
                step.active
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-400'
              )}
            >
              {step.active ? <Navigation className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {step.label}
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          <BuildingSelector
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onSelect={handleBuildingSelect}
          />

          {selectedBuilding && (
            <FloorSelector
              buildingName={selectedBuilding.name}
              floors={selectedBuilding.floors}
              selectedFloor={selectedFloor}
              onSelect={handleFloorSelect}
            />
          )}

          {/* Search */}
          <SearchDropdown
            query={searchQuery}
            onQueryChange={setSearchQuery}
            destinations={destinations}
            onSelect={handleDestinationSelect}
          />
        </div>

        {/* Right Panel - Map */}
        <div className="lg:col-span-2 space-y-4">
          <IndoorMap
            selectedDestination={destinationNode}
            onSelectDestination={handleRoomSelect}
            currentLocation={currentLocation}
            route={route}
          />

          {/* Current Location Info */}
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 flex items-center gap-3">
            <div className="relative w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">Current Location</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentLocation.replace(/_/g, ' ')} • updating live from BLE / QR / NFC / Wi-Fi / CV
              </p>
            </div>
          </div>

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
                {totalDistance > 0 && (
                  <div className="flex items-center gap-1">
                    <Footprints className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-primary-600">
                      {totalDistance} units
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNavigate}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Start Navigation
                </button>
              </div>
            </motion.div>
          )}

          {/* Turn-by-turn Instructions */}
          <AnimatePresence>
            {instructions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
              >
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Route className="w-4 h-4 text-primary-500" />
                  Turn-by-turn Directions
                </h3>
                <ol className="space-y-2">
                  {instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{inst}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent-600 dark:text-accent-400">
                  <CheckCircle className="w-4 h-4" />
                  You have arrived at {selectedDestination?.name}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
