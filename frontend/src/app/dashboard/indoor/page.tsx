'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Building2,
  ChevronRight,
  Flag,
  Footprints,
  Layers,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Volume2,
  X,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { navigationService } from '@/services/navigation';
import { useVoice } from '@/contexts/VoiceContext';
import { onVoiceEvent, VOICE_EVENTS } from '@/lib/voiceEvents';
import { cn } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type {
  Building,
  Floor,
  NavigationDestination,
  NavigationInstruction,
  NavigationRoute,
} from '@/types';

const DIRECTION_ICONS: Record<NavigationInstruction['direction'], React.ElementType> = {
  straight: ArrowUp,
  left: ArrowLeft,
  right: ArrowRight,
  up: ArrowUp,
  down: ArrowDown,
  arrived: Flag,
};

function formatWalkingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export default function IndoorNavigationPage() {
  const { currentNode, setCurrentNode, speak, announce } = useVoice();

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<NavigationDestination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFacilities, setShowFacilities] = useState(false);
  const [route, setRoute] = useState<NavigationRoute | null>(null);

  const {
    data: buildings,
    isLoading: buildingsLoading,
    error: buildingsError,
    refetch: refetchBuildings,
  } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => navigationService.getBuildings(),
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => navigationService.getDestinations(),
  });

  const { data: nodes } = useQuery({
    queryKey: ['nav-nodes'],
    queryFn: () => navigationService.getNodes(),
  });

  // Select the first building and floor once the campus data arrives.
  useEffect(() => {
    if (!selectedBuilding && buildings && buildings.length > 0) {
      const first = buildings[0];
      setSelectedBuilding(first);
      setSelectedFloor(first.floors[0] ?? null);
    }
  }, [buildings, selectedBuilding]);

  const routeMutation = useMutation({
    mutationFn: (variables: { from: string; toLocationId?: number; to?: string }) =>
      navigationService.getRoute({
        from: variables.from,
        to: variables.to,
        toLocationId: variables.toLocationId,
      }),
    onSuccess: (result) => {
      setRoute(result);
      const summary = `Route to ${result.end.name}. ${result.distance} metres, about ${formatWalkingTime(
        result.estimatedTime
      )}.`;
      announce(summary, { priority: 'assertive', force: true });
      toast.success(summary);
    },
    onError: (error: Error) => {
      setRoute(null);
      announce(error.message, { priority: 'assertive', force: true });
      toast.error(error.message);
    },
  });

  // `mutate` keeps a stable identity across renders, unlike the mutation
  // object, so effects and callbacks below can depend on it safely.
  const requestRoute = routeMutation.mutate;

  const startNavigation = useCallback(
    (destination: NavigationDestination) => {
      if (!currentNode) {
        const message = 'Choose where you are standing first, then start navigation.';
        announce(message, { priority: 'assertive', force: true });
        toast.error(message);
        return;
      }
      requestRoute({
        from: currentNode,
        toLocationId: Number(destination.id),
      });
    },
    [announce, currentNode, requestRoute]
  );

  // "Take me to BS-17A" spoken anywhere in the app lands here.
  useEffect(() => {
    return onVoiceEvent(VOICE_EVENTS.navigate, (detail) => {
      const match = destinations?.find((item) => item.nodeId === detail.nodeId);
      if (match) setSelectedDestination(match);

      if (detail.route) {
        setRoute(detail.route);
        return;
      }
      if (currentNode && detail.nodeId) {
        requestRoute({ from: currentNode, to: detail.nodeId });
      }
    });
  }, [currentNode, destinations, requestRoute]);

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(building.floors[0] ?? null);
    setSelectedDestination(null);
    setRoute(null);
  };

  const filteredDestinations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return (destinations ?? []).filter(
      (destination) =>
        destination.name.toLowerCase().includes(query) ||
        destination.building.toLowerCase().includes(query) ||
        destination.type.toLowerCase().includes(query)
    );
  }, [destinations, searchQuery]);

  /** Rooms on the map panel resolve through the location id, not a name guess. */
  const destinationsByName = useMemo(() => {
    const map = new Map<string, NavigationDestination>();
    (destinations ?? []).forEach((destination) => map.set(destination.name, destination));
    return map;
  }, [destinations]);

  const speakRoute = () => {
    if (!route) return;
    speak(route.spokenInstructions.join(' '));
  };

  if (buildingsError) {
    return (
      <ErrorMessage
        title="Could not load the campus map"
        message={(buildingsError as Error).message}
        onRetry={() => refetchBuildings()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold">Indoor Navigation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Pick where you are, choose a destination, and follow step-by-step guidance.
        </p>
      </motion.div>

      {/* Current location */}
      <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
        <label htmlFor="current-location" className="block text-sm font-semibold mb-2">
          <MapPin className="inline w-4 h-4 text-primary-500 mr-1.5" />
          Where are you right now?
        </label>
        <select
          id="current-location"
          value={currentNode ?? ''}
          onChange={(event) => {
            const value = event.target.value || null;
            setCurrentNode(value);
            setRoute(null);
            const node = nodes?.find((item) => item.nodeId === value);
            if (node) {
              announce(`Current location set to ${node.name}.`, { force: true });
            }
          }}
          className="input-field"
        >
          <option value="">Select your current location</option>
          {nodes?.map((node) => (
            <option key={node.nodeId} value={node.nodeId}>
              {node.name}
            </option>
          ))}
        </select>
        {!currentNode && (
          <p className="text-xs text-gray-500 mt-2">
            Guidance needs a starting point. Nearby signs and lift lobbies are good landmarks.
          </p>
        )}
      </div>

      {/* Route result */}
      {route && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          aria-live="polite"
          className="rounded-2xl bg-white dark:bg-dark-card border border-primary-200 dark:border-primary-900/30 overflow-hidden"
        >
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">
                {route.start.name} → {route.end.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {route.distance} metres • about {formatWalkingTime(route.estimatedTime)} •{' '}
                {route.instructions.length} steps
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={speakRoute}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Read directions
              </button>
              <button
                onClick={() => setRoute(null)}
                className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-dark-border"
                aria-label="Clear route"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ol className="divide-y divide-gray-200 dark:divide-dark-border">
            {route.instructions.map((instruction, index) => {
              const Icon = DIRECTION_ICONS[instruction.direction] ?? ArrowUp;
              return (
                <li key={`${instruction.text}-${index}`} className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      instruction.direction === 'arrived'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{instruction.text}</p>
                    {instruction.distance > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {instruction.distance} metres
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{index + 1}</span>
                </li>
              );
            })}
          </ol>
        </motion.section>
      )}

      {/* Step progress */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        {[
          { label: 'Start', active: !!currentNode },
          { label: 'Building', active: !!selectedBuilding },
          { label: 'Floor', active: !!selectedFloor },
          { label: 'Destination', active: !!selectedDestination },
        ].map((step, index, all) => (
          <React.Fragment key={step.label}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full font-medium',
                step.active
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-400'
              )}
            >
              {step.active ? (
                <Navigation className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              {step.label}
            </div>
            {index < all.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative z-40">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="input-field pl-12"
              placeholder="Search destinations..."
              aria-label="Search destinations"
            />

            {searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-h-72 overflow-y-auto">
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map((destination) => (
                    <button
                      key={destination.id}
                      onClick={() => {
                        setSelectedDestination(destination);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                    >
                      <div className="font-medium">{destination.name}</div>
                      <div className="text-xs text-gray-500">
                        {destination.building} • {destination.floor}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-500">No destination found</div>
                )}
              </div>
            )}
          </div>

          {/* Buildings */}
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-500" />
                Buildings
              </h2>
              <span className="text-xs text-gray-400">{buildings?.length ?? 0}</span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-[400px] overflow-y-auto">
              {buildingsLoading && (
                <div className="p-4 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading buildings...
                </div>
              )}
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

          {/* Floors */}
          {selectedBuilding && selectedBuilding.floors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-3"
            >
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-500" />
                Select Floor
              </h2>
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

          {/* Facilities */}
          {selectedFloor && selectedFloor.facilities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-3"
            >
              <button
                onClick={() => setShowFacilities(!showFacilities)}
                className="w-full flex items-center justify-between text-sm font-semibold"
                aria-expanded={showFacilities}
              >
                <span>Facilities on {selectedFloor.name}</span>
                <ChevronRight
                  className={cn('w-4 h-4 transition-transform', showFacilities && 'rotate-90')}
                />
              </button>
              {showFacilities && (
                <div className="mt-3 space-y-1">
                  {selectedFloor.facilities.map((facility) => (
                    <button
                      key={facility.id}
                      onClick={() => {
                        if (!currentNode || !facility.nodeId) return;
                        requestRoute({ from: currentNode, to: facility.nodeId });
                      }}
                      disabled={!currentNode || !facility.nodeId}
                      className="w-full flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      {facility.name}
                      <span className="text-xs text-gray-400 ml-auto capitalize">
                        {facility.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-border dark:to-dark-card border border-gray-200 dark:border-dark-border relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0v40M0 20h40\' stroke=\'%236366f1\' stroke-width=\'0.5\'/%3E%3C/svg%3E")',
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-dark-card shadow-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10 text-primary-500" />
                </div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">
                  {selectedBuilding
                    ? `${selectedBuilding.name} — ${selectedFloor?.name ?? 'Select floor'}`
                    : 'Select a building'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedDestination
                    ? `Destination: ${selectedDestination.name}`
                    : 'Choose a room from the list to plan a route'}
                </p>
              </div>
            </div>

            {/* Room labels */}
            {selectedFloor && selectedFloor.rooms.length > 0 && (
              <div className="absolute top-4 left-4 space-y-2 max-h-[calc(100%-2rem)] overflow-y-auto pr-2">
                {selectedFloor.rooms.map((room) => {
                  const destination = destinationsByName.get(room);
                  return (
                    <button
                      key={room}
                      onClick={() => destination && setSelectedDestination(destination)}
                      disabled={!destination}
                      className={cn(
                        'block px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium transition-colors disabled:opacity-50',
                        selectedDestination?.name === room
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/90 dark:bg-dark-card/90 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      )}
                    >
                      {room}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigate */}
          {selectedDestination && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30"
            >
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div>
                  <h2 className="font-semibold">{selectedDestination.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDestination.building} — {selectedDestination.floor}
                  </p>
                </div>
                {route && route.end.nodeId === selectedDestination.nodeId && (
                  <div className="flex items-center gap-1">
                    <Footprints className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-primary-600">
                      {formatWalkingTime(route.estimatedTime)}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => startNavigation(selectedDestination)}
                disabled={routeMutation.isPending || !currentNode}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {routeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {currentNode ? 'Start Navigation' : 'Select your location first'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
