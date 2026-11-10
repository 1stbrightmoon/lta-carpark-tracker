import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark } from '../types/carpark';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  userLocation: { lat: number; lng: number } | null;
  onGetLocation: () => void;
  isLocating: boolean;
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  userLocation,
  onGetLocation,
  isLocating,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const singaporeCenter: [number, number] = [1.3521, 103.8198];
    const map = L.map(mapContainerRef.current, {
      center: singaporeCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | Singapore Land Authority',
    }).addTo(map);

    // Add zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever carparks or selectedCarpark changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    carparks.forEach((cp) => {
      const isSelected = selectedCarpark?.id === cp.id;
      const isFull = cp.occupancy_status === 'FULL';
      const isLimited = cp.occupancy_status === 'LIMITED';
      const isModerate = cp.occupancy_status === 'MODERATE';

      const bgColor = isFull
        ? '#ef4444' // red-500
        : isLimited
        ? '#f97316' // orange-500
        : isModerate
        ? '#f59e0b' // amber-500
        : '#10b981'; // emerald-500

      const borderColor = isSelected ? '#0f172a' : '#ffffff';
      const borderWidth = isSelected ? '3px' : '2px';
      const scale = isSelected ? 'scale(1.18)' : 'scale(1)';
      const zIndexOffset = isSelected ? 1000 : 100;

      const markerHtml = `
        <div style="
          transform: ${scale};
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          background-color: ${bgColor};
          color: white;
          border: ${borderWidth} solid ${borderColor};
          border-radius: 9999px;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.22);
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        ">
          <span>${cp.lots_summary.available}</span>
          <span style="font-size: 8px; opacity: 0.85; font-family: sans-serif;">LOTS</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'carpark-marker-pin',
        iconSize: [68, 26],
        iconAnchor: [34, 13],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([cp.latitude, cp.longitude], {
        icon: customIcon,
        zIndexOffset,
      }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 12px 14px; min-width: 220px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin-bottom: 2px;">
            ${cp.carpark_number} · ${cp.area}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; line-height: 1.25;">
            ${cp.name}
          </div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px;">
            <span style="font-size: 20px; font-weight: 800; font-family: monospace; color: ${bgColor};">
              ${cp.lots_summary.available}
            </span>
            <span style="font-size: 11px; color: #64748b;">
              available / ${cp.lots_summary.total} total
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 10px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
            <div>Rates: ${cp.rates.weekday_day.split('(')[0]}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
              ${cp.free_parking !== 'NO' ? '✓ Free Sunday/PH Parking' : 'Standard EPS Gantry'}
            </div>
          </div>
          <button 
            id="popup-btn-${cp.id}"
            style="
              width: 100%;
              padding: 6px 12px;
              background-color: #0f172a;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            View Full Carpark Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${cp.id}`);
        if (btn) {
          btn.onclick = () => onSelectCarpark(cp);
        }
      });

      markersRef.current.push(marker);
    });
  }, [carparks, selectedCarpark, onSelectCarpark]);

  // Center on selected carpark
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCarpark) return;

    map.flyTo([selectedCarpark.latitude, selectedCarpark.longitude], 15, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedCarpark]);

  // Handle user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userHtml = `
      <div style="
        width: 18px;
        height: 18px;
        background-color: #2563eb;
        border: 3px solid white;
        border-radius: 9999px;
        box-shadow: 0 0 0 4px rgba(37,99,235,0.3);
      "></div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'user-location-pin',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 2000,
    })
      .addTo(map)
      .bindPopup('<b>Your Current Location</b>');

    map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.0 });
  }, [userLocation]);

  const handleResetSingaporeView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([1.3521, 103.8198], 12, { duration: 0.8 });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating map controls */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleResetSingaporeView}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Fit whole Singapore view"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Whole SG</span>
        </button>

        <button
          onClick={onGetLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-75"
          title="Detect nearest carparks from GPS"
        >
          <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-4">
        <span className="font-semibold text-slate-800 dark:text-slate-100">Live Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Ample (&gt;25%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span>Limited / Full</span>
        </div>
      </div>
    </div>
  );
};
