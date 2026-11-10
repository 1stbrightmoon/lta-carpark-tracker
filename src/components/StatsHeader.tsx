import React from 'react';
import { Carpark } from '../types/carpark';
import { Clock } from 'lucide-react';

interface StatsHeaderProps {
  carparks: Carpark[];
  lastUpdated: string;
  selectedRegion: string;
  onSelectRegion: (reg: any) => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  carparks,
  lastUpdated,
  selectedRegion,
  onSelectRegion,
  favoritesCount,
  showOnlyFavorites,
  onToggleOnlyFavorites,
}) => {
  const totalLots = carparks.reduce((sum, cp) => sum + cp.lots_summary.total, 0);
  const availableLots = carparks.reduce((sum, cp) => sum + cp.lots_summary.available, 0);
  const occupancyPct = totalLots > 0 ? Math.round(((totalLots - availableLots) / totalLots) * 100) : 0;

  const ampleCount = carparks.filter((cp) => cp.occupancy_status === 'AMPLE').length;
  const limitedOrFull = carparks.filter(
    (cp) => cp.occupancy_status === 'LIMITED' || cp.occupancy_status === 'FULL'
  ).length;

  const regions = ['ALL', 'Central', 'East', 'West', 'North', 'North-East'];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top metric row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-4">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Available Lots (SG)
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 flex items-baseline gap-2">
              <span>{availableLots.toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-400 font-sans">
                / {totalLots.toLocaleString()} total
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Islandwide Occupancy
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
              <span>{occupancyPct}%</span>
              <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    occupancyPct > 85
                      ? 'bg-rose-500'
                      : occupancyPct > 65
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Carparks With Lots
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-baseline gap-2">
              <span>{ampleCount} Ample</span>
              <span className="text-xs font-mono text-rose-500 dark:text-rose-400">
                · {limitedOrFull} Tight
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Data Sync</span>
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">
              {lastUpdated}
            </div>
            <div className="text-[11px] text-slate-400">EPS Feed & LTA Format</div>
          </div>
        </div>

        {/* Region & Saved quick selector bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Region:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => onSelectRegion(reg)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedRegion === reg
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {reg === 'ALL' ? 'All Singapore' : reg}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOnlyFavorites}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                showOnlyFavorites
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>★ Bookmarked</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 bg-black/15 rounded">
                {favoritesCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
