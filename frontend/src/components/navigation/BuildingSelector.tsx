'use client';

import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Building } from '@/types';

interface BuildingSelectorProps {
  buildings: Building[] | undefined;
  selectedBuilding: Building | null;
  onSelect: (building: Building) => void;
}

/**
 * Lists all buildings. Selecting one triggers the parent's building handler.
 */
export function BuildingSelector({
  buildings,
  selectedBuilding,
  onSelect,
}: BuildingSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden"
    >
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
            onClick={() => onSelect(building)}
            className={cn(
              'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors',
              selectedBuilding?.id === building.id &&
                'bg-primary-50 dark:bg-primary-900/20'
            )}
          >
            <p className="font-medium text-sm">{building.name}</p>
            <p className="text-xs text-gray-500">{building.floors.length} floors</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
