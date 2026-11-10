import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import {
  X,
  Star,
  MapPin,
  Clock,
  Navigation,
  DollarSign,
  Car,
  Check,
  Copy,
  ExternalLink,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  onToggleFavorite,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!carpark) return null;

  const { lots_summary, rates, historical_trend, nearby_amenities } = carpark;
  const carLots = lots_summary.breakdown.find((b) => b.type === 'C');
  const motoLots = lots_summary.breakdown.find((b) => b.type === 'Y');
  const heavyLots = lots_summary.breakdown.find((b) => b.type === 'H');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(carpark.carpark_number);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.latitude},${carpark.longitude}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.latitude},${carpark.longitude}&navigate=yes`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {carpark.carpark_number}
              </span>
              <span>·</span>
              <span>{carpark.area}</span>
              <span>·</span>
              <span>{carpark.region} Region</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {carpark.name}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{carpark.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                carpark.is_favorite
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-500'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Bookmark carpark"
            >
              <Star className={`w-5 h-5 ${carpark.is_favorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Lot Availability Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Lot Availability Breakdown
            </div>
            <div className="text-xs text-slate-400 font-mono">Updated {carpark.last_updated}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Cars */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Car Lots</span>
                <span className="font-mono text-[11px]">Type C</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {carLots?.available ?? 0}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  / {carLots?.total ?? 0}
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width: `${
                      carLots && carLots.total > 0
                        ? Math.min(100, Math.round((carLots.available / carLots.total) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Motorcycles */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Motorcycles</span>
                <span className="font-mono text-[11px]">Type Y</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {motoLots?.available ?? 0}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  / {motoLots?.total ?? 0}
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${
                      motoLots && motoLots.total > 0
                        ? Math.min(100, Math.round((motoLots.available / motoLots.total) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Heavy Vehicle */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Heavy Lots</span>
                <span className="font-mono text-[11px]">Type H</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {heavyLots?.available ?? 0}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  / {heavyLots?.total ?? 0}
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 transition-all"
                  style={{
                    width: `${
                      heavyLots && heavyLots.total > 0
                        ? Math.min(100, Math.round((heavyLots.available / heavyLots.total) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rates & Parking Policy */}
        <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Singapore Parking Tariff & Policies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400">Weekday Daytime (7am - 5pm/10:30pm)</div>
              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {rates.weekday_day}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Night Parking (10:30pm - 7am)</div>
              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {rates.weekday_night}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Sunday & Public Holidays</div>
              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {rates.weekend_day}
              </div>
            </div>
            <div>
              <div className="text-slate-400">EPS Grace Period & Gantry Clearance</div>
              <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {rates.grace_period_mins} mins grace · Max height {carpark.gantry_height}m
              </div>
            </div>
          </div>

          {carpark.free_parking !== 'NO' && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5" />
              <span>Free Parking Scheme applies: {carpark.free_parking}</span>
            </div>
          )}
        </div>

        {/* Typical Occupancy Trend Graph (Hourly) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Typical Daily Occupancy Pattern
            </div>
            <div className="text-xs text-slate-400">Peak hour insights</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="grid grid-cols-8 gap-2 items-end h-24 pt-4">
              {historical_trend.map((trend) => (
                <div key={trend.hour} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-t transition-all ${
                      trend.occupancyPct >= 85
                        ? 'bg-rose-500'
                        : trend.occupancyPct >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ height: `${trend.occupancyPct}%` }}
                    title={`${trend.hour}: ${trend.occupancyPct}% occupied`}
                  />
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {trend.hour.split(':')[0]}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nearby Amenities */}
        {nearby_amenities && nearby_amenities.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Walking Distance Landmarks
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {nearby_amenities.map((am) => (
                <div
                  key={am.name}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {am.name}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    ~{am.distanceM}m (
                    {Math.max(1, Math.round(am.distanceM / 75))} min walk)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions: Navigation & Copy Code */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied Carpark Code!' : `Copy Code (${carpark.carpark_number})`}</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Waze</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate in Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
