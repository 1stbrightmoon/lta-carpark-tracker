export type CarparkRegion = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export type CarparkType =
  | 'MULTI-STOREY CAR PARK'
  | 'SURFACE CAR PARK'
  | 'BASEMENT CAR PARK'
  | 'MECHANISED CAR PARK';

export type ParkingSystemType = 'ELECTRONIC PARKING SYSTEM' | 'COUPON PARKING';

export type LotAvailabilityStatus = 'AMPLE' | 'MODERATE' | 'LIMITED' | 'FULL';

export interface LotBreakdown {
  type: 'C' | 'Y' | 'H'; // C: Car, Y: Motorcycle, H: Heavy Vehicle
  label: string;
  total: number;
  available: number;
}

export interface Amenity {
  name: string;
  type: 'mrt' | 'mall' | 'food' | 'attraction';
  distanceM: number;
}

export interface CarparkRates {
  weekday_day: string; // e.g. "$1.20 per 30 mins"
  weekday_night: string; // e.g. "$0.60 per 30 mins, capped at $5.00"
  weekend_day: string;
  grace_period_mins: number; // 15 mins EPS
  central_pricing: boolean;
}

export interface HourlyTrend {
  hour: string; // e.g. "08:00", "12:00"
  occupancyPct: number; // 0 - 100
}

export interface Carpark {
  id: string; // Carpark code, e.g. "ACB", "TP26"
  carpark_number: string;
  name: string;
  address: string;
  area: string; // e.g. "Bugis", "Tampines Central", "Orchard"
  region: CarparkRegion;
  latitude: number;
  longitude: number;
  carpark_type: CarparkType;
  type_of_parking_system: ParkingSystemType;
  short_term_parking: 'WHOLE DAY' | '7AM-10.30PM' | 'NO';
  free_parking: 'SUN & PH 7.00AM - 10.30PM' | 'SUN & PH 1.00PM - 10.30PM' | 'NO';
  night_parking: 'YES' | 'NO';
  gantry_height: number; // in metres e.g. 2.15
  rates: CarparkRates;
  lots_summary: {
    total: number;
    available: number;
    breakdown: LotBreakdown[];
  };
  occupancy_status: LotAvailabilityStatus;
  last_updated: string;
  historical_trend: HourlyTrend[];
  nearby_amenities: Amenity[];
  is_favorite?: boolean;
}

export interface CarparkFilterState {
  searchQuery: string;
  region: CarparkRegion | 'ALL';
  carparkType: CarparkType | 'ALL';
  vehicleType: 'ALL' | 'C' | 'Y' | 'H';
  availabilityStatus: LotAvailabilityStatus | 'ALL';
  onlyFreeParking: boolean;
  onlyNightParking: boolean;
  maxGantryHeight?: number;
  sortBy: 'distance' | 'available' | 'occupancy' | 'name';
}
