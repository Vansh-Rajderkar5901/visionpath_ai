'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Loader2,
  Locate,
  MapPin,
  Navigation,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { navigationService } from '@/services/navigation';
import { onVoiceEvent, VOICE_EVENTS } from '@/lib/voiceEvents';
import { cn } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Building, NavigationDestination } from '@/types';

// Leaflet touches `window` at import time, so the whole map is client-only.
const CampusMap = dynamic(() => import('@/components/map/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  ),
});

const DEFAULT_CENTER: [number, number] = [21.1458, 79.0882];

export default function MapPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<NavigationDestination | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(16);

  const {
    data: buildings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => navigationService.getBuildings(),
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => navigationService.getDestinations(),
  });

  // Centre on the first building once the campus loads.
  useEffect(() => {
    if (!selectedBuilding && buildings && buildings.length > 0) {
      setMapCenter([buildings[0].latitude, buildings[0].longitude]);
    }
  }, [buildings, selectedBuilding]);

  // A spoken "where is X" highlights the match here too.
  useEffect(() => {
    return onVoiceEvent(VOICE_EVENTS.search, (detail) => {
      const first = detail.matches[0];
      if (!first) return;
      setSelectedDestination(first);
      const building = buildings?.find((item) => item.name === first.building);
      if (building) {
        setMapCenter([building.latitude, building.longitude]);
        setMapZoom(18);
      }
    });
  }, [buildings]);

  const query = searchQuery.trim().toLowerCase();

  const filteredBuildings = useMemo(
    () =>
      (buildings ?? []).filter(
        (building) =>
          !query ||
          building.name.toLowerCase().includes(query) ||
          building.code.toLowerCase().includes(query)
      ),
    [buildings, query]
  );

  const filteredDestinations = useMemo(
    () =>
      (destinations ?? []).filter(
        (destination) =>
          !query ||
          destination.name.toLowerCase().includes(query) ||
          destination.building.toLowerCase().includes(query)
      ),
    [destinations, query]
  );

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setMapCenter([building.latitude, building.longitude]);
    setMapZoom(18);
    setSelectedDestination(null);
  };

  const handleDestinationSelect = (destination: NavigationDestination) => {
    setSelectedDestination(destination);
    const building = buildings?.find((item) => item.code === destination.buildingCode);
    if (building) {
      setSelectedBuilding(building);
      setMapCenter([building.latitude, building.longitude]);
      setMapZoom(19);
    }
  };

  if (error) {
    return (
      <ErrorMessage
        title="Could not load the campus map"
        message={(error as Error).message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Side panel */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4 overflow-y-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="input-field pl-12"
            placeholder="Search buildings or rooms..."
            aria-label="Search locations"
          />
        </div>

        {/* Buildings */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-dark-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" />
              Buildings
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            )}
            {filteredBuildings.map((building) => (
              <button
                key={building.id}
                onClick={() => handleBuildingSelect(building)}
                className={cn(
                  'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
                  selectedBuilding?.id === building.id && 'bg-primary-50 dark:bg-primary-900/20'
                )}
              >
                <p className="font-medium text-sm">{building.name}</p>
                <p className="text-xs text-gray-500">
                  {building.code} • {building.floors.length}{' '}
                  {building.floors.length === 1 ? 'floor' : 'floors'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-dark-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-500" />
              Destinations
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-48 overflow-y-auto">
            {filteredDestinations.map((destination) => (
              <button
                key={destination.id}
                onClick={() => handleDestinationSelect(destination)}
                className={cn(
                  'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
                  selectedDestination?.id === destination.id &&
                    'bg-primary-50 dark:bg-primary-900/20'
                )}
              >
                <p className="font-medium text-sm">{destination.name}</p>
                <p className="text-xs text-gray-500">
                  {destination.building} • {destination.floor}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30"
          >
            <h3 className="font-semibold text-sm">{selectedBuilding.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {selectedBuilding.floors.length} floors •{' '}
              {selectedBuilding.floors.reduce((total, floor) => total + floor.rooms.length, 0)}{' '}
              rooms
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedBuilding.floors.map((floor) => (
                <span
                  key={floor.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
                >
                  {floor.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[400px] rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border relative">
        <CampusMap
          buildings={buildings ?? []}
          center={mapCenter}
          zoom={mapZoom}
          selectedBuildingId={selectedBuilding?.id ?? null}
          onBuildingSelect={handleBuildingSelect}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => setMapZoom((zoom) => Math.min(zoom + 1, 19))}
            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMapZoom((zoom) => Math.max(zoom - 1, 10))}
            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const first = buildings?.[0];
              setMapCenter(first ? [first.latitude, first.longitude] : DEFAULT_CENTER);
              setMapZoom(16);
            }}
            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            aria-label="Recentre map"
          >
            <Locate className="w-5 h-5" />
          </button>
        </div>

        {/* Destination card */}
        {selectedDestination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 z-[1000] p-4 rounded-2xl bg-white dark:bg-dark-card shadow-xl border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold">{selectedDestination.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedDestination.building} — {selectedDestination.floor}
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/indoor')}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate indoors
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
