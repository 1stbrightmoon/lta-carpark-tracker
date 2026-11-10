import React from 'react';
import { RefreshCw, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  activeTab: 'tracker' | 'calculator' | 'api-guide';
  setActiveTab: (tab: 'tracker' | 'calculator' | 'api-guide') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  totalAvailableLots: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRefreshing,
  onRefresh,
  darkMode,
  onToggleDarkMode,
  totalAvailableLots,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with subtle Singapore motif */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('tracker')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                P
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  ParkSG
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  Singapore Carpark Tracker
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: 3-4 clean single-line nav links with hover underlines */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                activeTab === 'tracker'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : ''
              }`}
            >
              Real-Time Tracker
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                activeTab === 'calculator'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : ''
              }`}
            >
              Parking Fee Estimator
            </button>
            <button
              onClick={() => setActiveTab('api-guide')}
              className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 py-1 ${
                activeTab === 'api-guide'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : ''
              }`}
            >
              Backend API Connect
            </button>
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all disabled:opacity-75 whitespace-nowrap"
              title="Simulate live lot check from sensors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Live Lots</span>
              <span className="sm:hidden">Sync</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
