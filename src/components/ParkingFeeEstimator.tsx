import React, { useState } from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';

export const ParkingFeeEstimator: React.FC = () => {
  const [tariffType, setTariffType] = useState<'hdb-standard' | 'hdb-central' | 'commercial'>('hdb-standard');
  const [dayType, setDayType] = useState<'weekday' | 'saturday' | 'sunday'>('weekday');
  const [startHour, setStartHour] = useState<number>(12); // 12pm
  const [startMinute, setStartMinute] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(120); // 2 hours
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car');

  // Calculate parking cost in Singapore dollars
  const calculateFee = () => {
    // Motorcycle flat rate: $0.65 per whole day or per entry
    if (vehicleType === 'motorcycle') {
      return {
        total: 0.65,
        breakdown: 'HDB Concession / EPS motorcycle per-session charge ($0.65 flat)',
        freePeriod: false,
      };
    }

    // 15 minute grace period
    if (durationMinutes <= 15) {
      return {
        total: 0.0,
        breakdown: 'Within 15-minute standard EPS grace period (Exit Free)',
        freePeriod: true,
      };
    }

    // Free parking on Sunday/PH for standard HDB (7:00 AM - 10:30 PM)
    if (dayType === 'sunday' && tariffType === 'hdb-standard') {
      const startTotalMins = startHour * 60 + startMinute;
      const endTotalMins = startTotalMins + durationMinutes;
      const freeStartMins = 7 * 60; // 7am
      const freeEndMins = 22 * 60 + 30; // 10:30pm

      if (startTotalMins >= freeStartMins && endTotalMins <= freeEndMins) {
        return {
          total: 0.0,
          breakdown: 'Qualifies for HDB Free Parking Scheme (Sun & PH 7.00am - 10.30pm)',
          freePeriod: true,
        };
      }
    }

    // Commercial / Mall
    if (tariffType === 'commercial') {
      const firstHourRate = 3.0;
      const subsequentHalfHourRate = 1.5;
      if (durationMinutes <= 60) {
        return {
          total: firstHourRate,
          breakdown: '$3.00 for the first hour',
          freePeriod: false,
        };
      }
      const extraMinutes = durationMinutes - 60;
      const extraHalfHours = Math.ceil(extraMinutes / 30);
      const total = firstHourRate + extraHalfHours * subsequentHalfHourRate;
      return {
        total: Number(total.toFixed(2)),
        breakdown: `$3.00 (1st hr) + ${extraHalfHours} × $1.50 (subsequent half hours)`,
        freePeriod: false,
      };
    }

    // HDB Standard: $0.60 per 30 mins
    if (tariffType === 'hdb-standard') {
      const halfHours = Math.ceil(durationMinutes / 30);
      const rate = 0.6;
      let total = halfHours * rate;
      // Night cap $5.00 between 10:30pm and 7:00am
      if (startHour >= 22 || startHour < 6) {
        total = Math.min(total, 5.0);
      }
      return {
        total: Number(total.toFixed(2)),
        breakdown: `${halfHours} half-hour blocks × $0.60 per block (Standard HDB rate)`,
        freePeriod: false,
      };
    }

    // HDB Central Area: $1.20 per 30 mins (7am-5pm Mon-Sat), $0.60 per 30 mins other times
    if (tariffType === 'hdb-central') {
      const isPeakHour = startHour >= 7 && startHour < 17 && dayType !== 'sunday';
      const halfHours = Math.ceil(durationMinutes / 30);
      const rate = isPeakHour ? 1.2 : 0.6;
      let total = halfHours * rate;
      if (startHour >= 22 || startHour < 6) {
        total = Math.min(total, 5.0);
      }
      return {
        total: Number(total.toFixed(2)),
        breakdown: `${halfHours} blocks × $${rate.toFixed(2)} (${
          isPeakHour ? 'Central Peak 7am-5pm' : 'Non-peak'
        })`,
        freePeriod: false,
      };
    }

    return { total: 0, breakdown: 'Standard calculation', freePeriod: false };
  };

  const result = calculateFee();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-600" />
          <span>Singapore Parking Fee Estimator</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Estimate parking charges based on statutory HDB, URA, and standard commercial rates with EPS grace periods and Sunday schemes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Inputs (2 cols) */}
        <div className="md:col-span-2 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('car')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  vehicleType === 'car'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Motorcar (Standard)
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('motorcycle')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                  vehicleType === 'motorcycle'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Motorcycle ($0.65 Concession)
              </button>
            </div>
          </div>

          {/* Location / Tariff Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Carpark Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTariffType('hdb-standard')}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  tariffType === 'hdb-standard'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">HDB / URA Standard</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  $0.60 / 30 mins
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTariffType('hdb-central')}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  tariffType === 'hdb-central'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">HDB Central Area</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  $1.20 / 30 mins peak
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTariffType('commercial')}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  tariffType === 'commercial'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">Commercial / Mall</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ~$3.00 1st hr, $1.50/half
                </div>
              </button>
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Day of Week
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'weekday', label: 'Mon - Fri' },
                { id: 'saturday', label: 'Saturday' },
                { id: 'sunday', label: 'Sun & PH (Free Scheme)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDayType(item.id as any)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    dayType === item.id
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 border-transparent'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Entry Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Arrival Time
              </label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i === 0
                      ? '12:00 AM (Midnight)'
                      : i < 12
                      ? `${i}:00 AM`
                      : i === 12
                      ? '12:00 PM (Noon)'
                      : `${i - 12}:00 PM`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Parking Duration
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="480"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10 mins (Grace)</span>
                <span>2 hours</span>
                <span>4 hours</span>
                <span>8 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Fee Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estimated Total Fee
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                ${result.total.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-mono">SGD</span>
            </div>

            {result.freePeriod && (
              <div className="mt-3 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complimentary / Grace Exit</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Calculation Breakdown:
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                {result.breakdown}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 leading-normal">
            Note: Actual fees may vary slightly by carpark operator and prevailing GST. Always refer to gantry entry rate board.
          </div>
        </div>
      </div>
    </div>
  );
};
