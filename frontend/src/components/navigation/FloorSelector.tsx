'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, MapPin, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Floor } from '@/types';

interface FloorSelectorProps {
  buildingName: string;
  floors: Floor[];
  selectedFloor: Floor | null;
  onSelect: (floor: Floor) => void;
}

/**
 * Floor buttons + expandable list of facilities on the selected floor.
 */
export function FloorSelector({
  buildingName,
  floors,
  selectedFloor,
  onSelect,
}: FloorSelectorProps) {
  const [showFacilities, setShowFacilities] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border p-3 space-y-3"
    >
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary-500" />
        Select Floor
      </h3>
      <div className="flex flex-wrap gap-2">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => onSelect(floor)}
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

      {selectedFloor && (
        <div>
          <button
            onClick={() => setShowFacilities((s) => !s)}
            className="w-full flex items-center justify-between text-sm font-semibold"
          >
            <span>Facilities on {selectedFloor.name}</span>
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-transform',
                showFacilities && 'rotate-90'
              )}
            />
          </button>
          {showFacilities && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="mt-2 space-y-1 overflow-hidden"
            >
              {selectedFloor.facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  {facility.name}
                  <span className="text-xs text-gray-400 ml-auto capitalize">
                    {facility.type}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Showing {floors.length} floor(s) for {buildingName}
      </p>
    </motion.div>
  );
}
