'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Search,
  Navigation,
  Building2,
  MapPin,
  ZoomIn,
  ZoomOut,
  Layers,
  Locate,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { navigationService } from '@/services/navigation';
import { cn } from '@/lib/utils';
import type { Building, NavigationDestination } from '@/types';

// Dynamically import Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<NavigationDestination | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.1458, 79.0882]); // Default center (Nagpur, India)
  const [mapZoom, setMapZoom] = useState(15);
  const [isMapReady, setIsMapReady] = useState(false);

  const { data: buildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: navigationService.getBuildings,
  });

  const { data: destinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: navigationService.getDestinations,
  });

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredBuildings = buildings?.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDestinations = destinations?.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setMapCenter([building.latitude, building.longitude]);
    setMapZoom(17);
    setSelectedDestination(null);
  };

  const handleDestinationSelect = (destination: NavigationDestination) => {
    setSelectedDestination(destination);
    const building = buildings?.find((b) => b.name === destination.building);
    if (building) {
      setMapCenter([building.latitude, building.longitude]);
      setMapZoom(18);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Side Panel */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
            placeholder="Search buildings or rooms..."
            aria-label="Search locations"
          />
        </div>

        {/* Buildings List */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-dark-border">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" />
              Buildings
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-64 overflow-y-auto">
            {filteredBuildings?.map((building) => (
              <button
                key={building.id}
                onClick={() => handleBuildingSelect(building)}
                className={cn(
                  'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
                  selectedBuilding?.id === building.id && 'bg-primary-50 dark:bg-primary-900/20'
                )}
              >
                <p className="font-medium text-sm">{building.name}</p>
                <p className="text-xs text-gray-500">{building.code} • {building.floors.length} floors</p>
              </button>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-dark-border">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-500" />
              Popular Destinations
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-border max-h-48 overflow-y-auto">
            {filteredDestinations?.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleDestinationSelect(dest)}
                className={cn(
                  'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
                  selectedDestination?.id === dest.id && 'bg-primary-50 dark:bg-primary-900/20'
                )}
              >
                <p className="font-medium text-sm">{dest.name}</p>
                <p className="text-xs text-gray-500">{dest.building} • {dest.floor}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Info */}
        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/30"
          >
            <h4 className="font-semibold text-sm">{selectedBuilding.name}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {selectedBuilding.floors.length} floors • {selectedBuilding.floors.reduce((acc, f) => acc + f.rooms.length, 0)} rooms
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedBuilding.floors.map((floor) => (
                <span key={floor.id} className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
                  {floor.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border relative">
        {!isMapReady ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {buildings?.map((building) => (
              <Marker
                key={building.id}
                position={[building.latitude, building.longitude]}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{building.name}</strong>
                    <br />
                    {building.code} • {building.floors.length} floors
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            onClick={() => setMapZoom((z) => Math.min(z + 1, 19))}
            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMapZoom((z) => Math.max(z - 1, 10))}
            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMapCenter([21.1458, 79.0882])} // Reset to default center
            className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
            aria-label="Recenter map"
          >
            <Locate className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Info */}
        {selectedDestination && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 z-[1000] p-4 rounded-2xl bg-white dark:bg-dark-card shadow-xl border border-gray-200 dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{selectedDestination.name}</h4>
                <p className="text-sm text-gray-500">{selectedDestination.building} - {selectedDestination.floor}</p>
              </div>
              <button className="btn-primary text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

