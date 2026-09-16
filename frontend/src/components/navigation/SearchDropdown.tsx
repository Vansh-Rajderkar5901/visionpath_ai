'use client';

import { Search, MapPin } from 'lucide-react';
import type { NavigationDestination } from '@/types';

interface SearchDropdownProps {
  query: string;
  onQueryChange: (q: string) => void;
  destinations: NavigationDestination[] | undefined;
  onSelect: (dest: NavigationDestination) => void;
}

/**
 * Search box with a floating dropdown list.
 * - dropdown appears below the box, floats above the map (high z-index)
 * - closes after a selection
 * - selecting a destination highlights it on the map (handled by parent)
 */
export function SearchDropdown({
  query,
  onQueryChange,
  destinations,
  onSelect,
}: SearchDropdownProps) {
  const filtered = destinations?.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.building.toLowerCase().includes(query.toLowerCase()) ||
      d.floor.toLowerCase().includes(query.toLowerCase())
  );

  const showDropdown = query.trim() !== '' && !!destinations;

  return (
    <div className="relative z-50">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="input-field pl-12"
        placeholder="Search destinations..."
        aria-label="Search destinations"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border max-h-80 overflow-y-auto">
          {filtered && filtered.length > 0 ? (
            filtered.map((dest) => (
              <button
                key={dest.id}
                onClick={() => {
                  onSelect(dest);
                  onQueryChange('');
                }}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">{dest.name}</div>
                  <div className="text-xs text-gray-500">
                    {dest.building} • {dest.floor}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-500 text-sm">No destination found</div>
          )}
        </div>
      )}
    </div>
  );
}
