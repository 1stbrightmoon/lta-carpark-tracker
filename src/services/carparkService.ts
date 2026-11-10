import { Carpark, CarparkFilterState, LotAvailabilityStatus } from '../types/carpark';
import { INITIAL_CARPARKS } from '../data/mockCarparks';

const FAVORITES_STORAGE_KEY = 'parksg_favorites_v1';

// Calculate Haversine distance in kilometres between two coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Compute occupancy status based on availability percentage
export function computeOccupancyStatus(available: number, total: number): LotAvailabilityStatus {
  if (total <= 0) return 'FULL';
  const pct = (available / total) * 100;
  if (available <= 0) return 'FULL';
  if (pct < 10 || available <= 15) return 'LIMITED';
  if (pct <= 30) return 'MODERATE';
  return 'AMPLE';
}

export class CarparkService {
  private carparks: Carpark[];

  constructor() {
    this.carparks = this.loadInitialData();
  }

  private loadInitialData(): Carpark[] {
    const favorites = this.getFavorites();
    return INITIAL_CARPARKS.map((carpark) => ({
      ...carpark,
      is_favorite: favorites.includes(carpark.id),
    }));
  }

  public getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public toggleFavorite(id: string): boolean {
    const favorites = new Set(this.getFavorites());
    let newState = false;
    if (favorites.has(id)) {
      favorites.delete(id);
      newState = false;
    } else {
      favorites.add(id);
      newState = true;
    }
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favorites)));
    } catch (e) {
      console.warn('Unable to persist favorite to localStorage:', e);
    }

    this.carparks = this.carparks.map((cp) =>
      cp.id === id ? { ...cp, is_favorite: newState } : cp
    );
    return newState;
  }

  /**
   * Retrieves carpark list.
   * NOTE FOR BACKEND INTEGRATION:
   * Replace this mock data retrieval with your API call, e.g.:
   * const res = await fetch('/api/carparks/availability');
   * return await res.json();
   */
  public async fetchCarparks(): Promise<Carpark[]> {
    return [...this.carparks];
  }

  /**
   * Simulates real-time lot fluctuation (e.g. cars entering/exiting gantries).
   * In a live backend setup, this calls the live LTA DataMall / data.gov.sg Carpark Availability API.
   */
  public simulateLiveRefresh(): Carpark[] {
    this.carparks = this.carparks.map((cp) => {
      // Simulate minor fluctuation (-5 to +5 lots)
      const delta = Math.floor(Math.random() * 9) - 4;
      const carLot = cp.lots_summary.breakdown.find((b) => b.type === 'C');
      const motoLot = cp.lots_summary.breakdown.find((b) => b.type === 'Y');

      let newCarAvail = (carLot ? carLot.available : cp.lots_summary.available) + delta;
      if (carLot) {
        newCarAvail = Math.max(0, Math.min(carLot.total, newCarAvail));
      }

      const newBreakdown = cp.lots_summary.breakdown.map((item) => {
        if (item.type === 'C') {
          return { ...item, available: newCarAvail };
        }
        return item;
      });

      const totalAvail = newBreakdown.reduce((sum, item) => sum + item.available, 0);
      const totalCapacity = cp.lots_summary.total;
      const newStatus = computeOccupancyStatus(totalAvail, totalCapacity);

      return {
        ...cp,
        lots_summary: {
          ...cp.lots_summary,
          available: totalAvail,
          breakdown: newBreakdown,
        },
        occupancy_status: newStatus,
        last_updated: 'Just now',
      };
    });

    return [...this.carparks];
  }

  /**
   * Filter and sort carparks based on user criteria
   */
  public filterCarparks(
    list: Carpark[],
    filters: CarparkFilterState,
    userCoords?: { lat: number; lng: number } | null
  ): Carpark[] {
    let result = [...list];

    // Search Query (carpark code, name, address, area)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (cp) =>
          cp.carpark_number.toLowerCase().includes(q) ||
          cp.name.toLowerCase().includes(q) ||
          cp.address.toLowerCase().includes(q) ||
          cp.area.toLowerCase().includes(q)
      );
    }

    // Region Filter
    if (filters.region !== 'ALL') {
      result = result.filter((cp) => cp.region === filters.region);
    }

    // Carpark Type Filter
    if (filters.carparkType !== 'ALL') {
      result = result.filter((cp) => cp.carpark_type === filters.carparkType);
    }

    // Vehicle Type Availability
    if (filters.vehicleType !== 'ALL') {
      result = result.filter((cp) => {
        const lot = cp.lots_summary.breakdown.find((b) => b.type === filters.vehicleType);
        return lot && lot.available > 0;
      });
    }

    // Availability Status Filter
    if (filters.availabilityStatus !== 'ALL') {
      result = result.filter((cp) => cp.occupancy_status === filters.availabilityStatus);
    }

    // Free Parking Filter
    if (filters.onlyFreeParking) {
      result = result.filter((cp) => cp.free_parking !== 'NO');
    }

    // Night Parking Filter
    if (filters.onlyNightParking) {
      result = result.filter((cp) => cp.night_parking === 'YES');
    }

    // Gantry clearance height filter
    if (filters.maxGantryHeight) {
      result = result.filter((cp) => cp.gantry_height >= (filters.maxGantryHeight || 0));
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'distance' && userCoords) {
        const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude);
        const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude);
        return distA - distB;
      }
      if (filters.sortBy === 'available') {
        return b.lots_summary.available - a.lots_summary.available;
      }
      if (filters.sortBy === 'occupancy') {
        const occA = 1 - a.lots_summary.available / a.lots_summary.total;
        const occB = 1 - b.lots_summary.available / b.lots_summary.total;
        return occA - occB; // least occupied first
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }
}

export const carparkService = new CarparkService();
