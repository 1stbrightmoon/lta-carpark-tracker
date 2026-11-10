import React, { useState, useEffect, useMemo } from 'react';
import { Carpark, CarparkFilterState } from './types/carpark';
import { carparkService } from './services/carparkService';
import { Navbar } from './components/Navbar';
import { StatsHeader } from './components/StatsHeader';
import { FilterBar } from './components/FilterBar';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { ParkingFeeEstimator } from './components/ParkingFeeEstimator';
import { ApiIntegrationGuide } from './components/ApiIntegrationGuide';
import { Map, LayoutList, Split, Frown } from 'lucide-react';

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>([]);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'calculator' | 'api-guide'>('tracker');
  const [viewLayout, setViewLayout] = useState<'split' | 'map' | 'list'>('split');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // User GPS coordinates
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('parksg_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Filter state
  const [filters, setFilters] = useState<CarparkFilterState>({
    searchQuery: '',
    region: 'ALL',
    carparkType: 'ALL',
    vehicleType: 'ALL',
    availabilityStatus: 'ALL',
    onlyFreeParking: false,
    onlyNightParking: false,
    sortBy: 'available',
  });

  // Load initial carparks
  useEffect(() => {
    carparkService.fetchCarparks().then((res) => {
      setCarparks(res.carparks);
      if (res.isLiveConnected) {
        setLastUpdatedTime('Live LTA DataMall');
      }
    });
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('parksg_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('parksg_theme', 'light');
    }
  }, [darkMode]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const res = await carparkService.refreshAvailability();
    setCarparks(res.carparks);
    setLastUpdatedTime(
      res.isLiveConnected
        ? 'Live LTA DataMall'
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    setIsRefreshing(false);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    carparkService.toggleFavorite(id);
    setCarparks((prev) =>
      prev.map((cp) => (cp.id === id ? { ...cp, is_favorite: !cp.is_favorite } : cp))
    );
    if (selectedCarpark && selectedCarpark.id === id) {
      setSelectedCarpark((prev) => (prev ? { ...prev, is_favorite: !prev.is_favorite } : null));
    }
  };

  // Get User Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to Singapore central coordinates for demo if permission denied
        setUserLocation({ lat: 1.2966, lng: 103.852 });
        setFilters((prev) => ({ ...prev, sortBy: 'distance' }));
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Quick Hotspot selection
  const handleSelectHotspot = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
      region: 'ALL',
    }));
  };

  // Filtered carparks list
  const filteredCarparks = useMemo(() => {
    let list = carparkService.filterCarparks(carparks, filters, userLocation);
    if (showOnlyFavorites) {
      list = list.filter((cp) => cp.is_favorite);
    }
    return list;
  }, [carparks, filters, userLocation, showOnlyFavorites]);

  const favoritesCount = useMemo(() => {
    return carparks.filter((cp) => cp.is_favorite).length;
  }, [carparks]);

  const totalAvailableLots = useMemo(() => {
    return carparks.reduce((sum, cp) => sum + cp.lots_summary.available, 0);
  }, [carparks]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        totalAvailableLots={totalAvailableLots}
      />

      {/* Main Content Areas based on activeTab */}
      {activeTab === 'tracker' && (
        <main className="flex-1 flex flex-col">
          {/* Key Singapore Telemetry Strip */}
          <StatsHeader
            carparks={carparks}
            lastUpdated={lastUpdatedTime}
            selectedRegion={filters.region}
            onSelectRegion={(reg) => setFilters({ ...filters, region: reg })}
            favoritesCount={favoritesCount}
            showOnlyFavorites={showOnlyFavorites}
            onToggleOnlyFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
          />

          {/* Body Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1 flex flex-col">
            {/* Search & Filter Controls */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={() =>
                setFilters({
                  searchQuery: '',
                  region: 'ALL',
                  carparkType: 'ALL',
                  vehicleType: 'ALL',
                  availabilityStatus: 'ALL',
                  onlyFreeParking: false,
                  onlyNightParking: false,
                  sortBy: 'available',
                })
              }
              totalFilteredCount={filteredCarparks.length}
              totalCount={carparks.length}
              onSelectHotspot={handleSelectHotspot}
            />

            {/* Layout Switcher (Split vs Map vs Cards) */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {showOnlyFavorites ? (
                  <span>Bookmarked Singapore Carparks</span>
                ) : filters.region !== 'ALL' ? (
                  <span>{filters.region} Singapore Carparks</span>
                ) : (
                  <span>Islandwide Carpark Network</span>
                )}
              </div>

              {/* View layout segmented toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setViewLayout('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    viewLayout === 'split'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Dual Map & List View"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split View</span>
                </button>
                <button
                  onClick={() => setViewLayout('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    viewLayout === 'map'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Map View"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map View</span>
                </button>
                <button
                  onClick={() => setViewLayout('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                    viewLayout === 'list'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Cards View"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards View</span>
                </button>
              </div>
            </div>

            {/* Content View Layouts */}
            {viewLayout === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
                {/* Left: Carpark Cards scrollable list (5 cols) */}
                <div className="lg:col-span-5 space-y-3 order-2 lg:order-1 max-h-[720px] overflow-y-auto pr-1">
                  {filteredCarparks.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <Frown className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        No carparks match your filter criteria
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Try clearing filters or searching for another Singapore town.
                      </p>
                      <button
                        onClick={() =>
                          setFilters({
                            searchQuery: '',
                            region: 'ALL',
                            carparkType: 'ALL',
                            vehicleType: 'ALL',
                            availabilityStatus: 'ALL',
                            onlyFreeParking: false,
                            onlyNightParking: false,
                            sortBy: 'available',
                          })
                        }
                        className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:opacity-90"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    filteredCarparks.map((cp) => (
                      <CarparkCard
                        key={cp.id}
                        carpark={cp}
                        isSelected={selectedCarpark?.id === cp.id}
                        onSelect={() => setSelectedCarpark(cp)}
                        onToggleFavorite={(e) => handleToggleFavorite(cp.id, e)}
                        userCoords={userLocation}
                      />
                    ))
                  )}
                </div>

                {/* Right: Leaflet Interactive Map (7 cols) */}
                <div className="lg:col-span-7 order-1 lg:order-2 h-[380px] lg:h-[720px] sticky top-20">
                  <CarparkMap
                    carparks={filteredCarparks}
                    selectedCarpark={selectedCarpark}
                    onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                    userLocation={userLocation}
                    onGetLocation={handleGetLocation}
                    isLocating={isLocating}
                  />
                </div>
              </div>
            )}

            {viewLayout === 'map' && (
              <div className="w-full h-[680px]">
                <CarparkMap
                  carparks={filteredCarparks}
                  selectedCarpark={selectedCarpark}
                  onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                  userLocation={userLocation}
                  onGetLocation={handleGetLocation}
                  isLocating={isLocating}
                />
              </div>
            )}

            {viewLayout === 'list' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCarparks.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Frown className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      No carparks match your filter criteria
                    </div>
                  </div>
                ) : (
                  filteredCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      isSelected={selectedCarpark?.id === cp.id}
                      onSelect={() => setSelectedCarpark(cp)}
                      onToggleFavorite={(e) => handleToggleFavorite(cp.id, e)}
                      userCoords={userLocation}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {activeTab === 'calculator' && (
        <main className="flex-1">
          <ParkingFeeEstimator />
        </main>
      )}

      {activeTab === 'api-guide' && (
        <main className="flex-1">
          <ApiIntegrationGuide />
        </main>
      )}

      {/* Selected Carpark Detail Modal */}
      {selectedCarpark && (
        <CarparkDetailModal
          carpark={selectedCarpark}
          onClose={() => setSelectedCarpark(null)}
          onToggleFavorite={(id) => handleToggleFavorite(id)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            ParkSG · Singapore Real-Time Carpark Availability Network
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>EPS Gantry Compatible</span>
            <span>·</span>
            <span>HDB & URA Data Ready</span>
            <span>·</span>
            <span>Singapore Open Data Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
