import React from 'react';
import { CarparkFilterState, CarparkType, LotAvailabilityStatus } from '../types/carpark';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface FilterBarProps {
  filters: CarparkFilterState;
  onFilterChange: (newFilters: CarparkFilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalCount: number;
  onSelectHotspot: (name: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
  totalCount,
  onSelectHotspot,
}) => {
  const hotspots = [
    { label: 'Bugis', query: 'Bugis' },
    { label: 'Orchard', query: 'Orchard' },
    { label: 'Marina Bay', query: 'Marina Bay' },
    { label: 'Tampines', query: 'Tampines' },
    { label: 'Jurong East', query: 'Jurong East' },
    { label: 'Woodlands', query: 'Woodlands' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-4 transition-colors">
      {/* Top Search Input & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by Carpark Code (e.g. ACB, TP26), Mall, or Street..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  sortBy: e.target.value as any,
                })
              }
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="available">Sort: Most Available Lots</option>
              <option value="occupancy">Sort: Lowest Occupancy %</option>
              <option value="distance">Sort: Nearest Distance</option>
              <option value="name">Sort: Carpark Name</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {(filters.searchQuery ||
            filters.region !== 'ALL' ||
            filters.carparkType !== 'ALL' ||
            filters.availabilityStatus !== 'ALL' ||
            filters.onlyFreeParking ||
            filters.vehicleType !== 'ALL') && (
            <button
              onClick={onResetFilters}
              className="px-2.5 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Popular SG Hotspot Jumpers */}
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs overflow-x-auto pb-1">
        <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Hotspots:</span>
        {hotspots.map((spot) => (
          <button
            key={spot.label}
            onClick={() => onSelectHotspot(spot.query)}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 dark:hover:text-emerald-400 text-[11px] font-medium transition-colors whitespace-nowrap"
          >
            {spot.label}
          </button>
        ))}
      </div>

      {/* Filter Chips & Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        {/* Carpark Type selector */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Type:</span>
          <select
            value={filters.carparkType}
            onChange={(e) =>
              onFilterChange({ ...filters, carparkType: e.target.value as any })
            }
            className="bg-transparent font-medium text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 py-0.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Types</option>
            <option value="MULTI-STOREY CAR PARK">Multi-Storey (MSCP)</option>
            <option value="BASEMENT CAR PARK">Basement</option>
            <option value="SURFACE CAR PARK">Surface</option>
          </select>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* Vehicle Type */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Lots For:</span>
          <select
            value={filters.vehicleType}
            onChange={(e) =>
              onFilterChange({ ...filters, vehicleType: e.target.value as any })
            }
            className="bg-transparent font-medium text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 py-0.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Vehicles</option>
            <option value="C">Cars (C)</option>
            <option value="Y">Motorcycles (Y)</option>
            <option value="H">Heavy Vehicles (H)</option>
          </select>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* Availability status */}
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Status:</span>
          <select
            value={filters.availabilityStatus}
            onChange={(e) =>
              onFilterChange({ ...filters, availabilityStatus: e.target.value as any })
            }
            className="bg-transparent font-medium text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 py-0.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="AMPLE">Ample Lots</option>
            <option value="MODERATE">Moderate</option>
            <option value="LIMITED">Limited</option>
            <option value="FULL">Full</option>
          </select>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* Free Parking Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
          <input
            type="checkbox"
            checked={filters.onlyFreeParking}
            onChange={(e) =>
              onFilterChange({ ...filters, onlyFreeParking: e.target.checked })
            }
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>Free Sun/PH</span>
        </label>

        {/* Results Counter */}
        <div className="ml-auto text-xs text-slate-400 font-mono">
          Showing <strong className="text-slate-700 dark:text-slate-200">{totalFilteredCount}</strong> of {totalCount} carparks
        </div>
      </div>
    </div>
  );
};
