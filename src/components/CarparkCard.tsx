import React from 'react';
import { Carpark } from '../types/carpark';
import { Star, ArrowUpRight } from 'lucide-react';
import { calculateDistanceKm } from '../services/carparkService';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  userCoords?: { lat: number; lng: number } | null;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  onSelect,
  onToggleFavorite,
  userCoords,
}) => {
  const { lots_summary, rates, occupancy_status } = carpark;
  const carLots = lots_summary.breakdown.find((b) => b.type === 'C');
  const motoLots = lots_summary.breakdown.find((b) => b.type === 'Y');

  const occupancyRatio =
    lots_summary.total > 0
      ? Math.round(((lots_summary.total - lots_summary.available) / lots_summary.total) * 100)
      : 100;

  // Status text color (unboxed text style)
  const statusColorClass =
    occupancy_status === 'FULL'
      ? 'text-rose-600 dark:text-rose-400 font-semibold'
      : occupancy_status === 'LIMITED'
      ? 'text-orange-600 dark:text-orange-400 font-semibold'
      : occupancy_status === 'MODERATE'
      ? 'text-amber-600 dark:text-amber-400 font-semibold'
      : 'text-emerald-600 dark:text-emerald-400 font-semibold';

  const statusLabel =
    occupancy_status === 'FULL'
      ? 'Full (0 Lots)'
      : occupancy_status === 'LIMITED'
      ? 'Crowded (<10%)'
      : occupancy_status === 'MODERATE'
      ? 'Moderate Lots'
      : 'Ample Lots';

  const distance = userCoords
    ? calculateDistanceKm(userCoords.lat, userCoords.lng, carpark.latitude, carpark.longitude)
    : null;

  return (
    <div
      onClick={onSelect}
      className={`group relative p-4 rounded-xl transition-all cursor-pointer border bg-white dark:bg-slate-900 ${
        isSelected
          ? 'border-slate-900 dark:border-emerald-500 shadow-md ring-1 ring-slate-900 dark:ring-emerald-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      {/* Top Header: Carpark Code & Actions */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider">
            {carpark.carpark_number}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{carpark.area}</span>
          {distance !== null && (
            <>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                {distance} km away
              </span>
            </>
          )}
        </div>

        <button
          onClick={onToggleFavorite}
          aria-label={carpark.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-1.5 -mr-1 -mt-1 rounded-md transition-colors ${
            carpark.is_favorite
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
          }`}
        >
          <Star className={`w-4 h-4 ${carpark.is_favorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Carpark Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {carpark.name}
      </h3>

      {/* Clean Unboxed Metadata (Zero-Pill Discipline) */}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{carpark.carpark_type.replace(' CAR PARK', '')}</span>
        <span aria-hidden="true">·</span>
        <span>{carpark.gantry_height}m clearance</span>
        <span aria-hidden="true">·</span>
        <span>{carpark.type_of_parking_system === 'ELECTRONIC PARKING SYSTEM' ? 'EPS' : 'Coupon'}</span>
        {carpark.free_parking !== 'NO' && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Free Sun/PH
            </span>
          </>
        )}
      </div>

      {/* Real-Time Availability Display */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
        <div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Available Lots
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {lots_summary.available}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {lots_summary.total}
            </span>
            <span className={`text-xs ml-1 ${statusColorClass}`}>{statusLabel}</span>
          </div>

          {/* Breakdown for Cars vs Bikes */}
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {carLots && (
              <span>
                Cars: <strong className="text-slate-700 dark:text-slate-200">{carLots.available}</strong>
              </span>
            )}
            {motoLots && (
              <span>
                Bikes: <strong className="text-slate-700 dark:text-slate-200">{motoLots.available}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Small Progress / Action */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[10px] font-mono text-slate-400">
            {occupancyRatio}% Occupied
          </div>
          <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                occupancyRatio > 90
                  ? 'bg-rose-500'
                  : occupancyRatio > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyRatio}%` }}
            />
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 mt-1">
            Details <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
