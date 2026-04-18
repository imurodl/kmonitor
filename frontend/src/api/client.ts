import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const client = axios.create({
  baseURL: API_BASE_URL,
});

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  count: number;
}

export interface Earthquake {
  id: number;
  externalId: string;
  magnitude: number | null;
  depth: number | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  occurredAt: string;
  fetchedAt: string;
}

export interface DisasterAlert {
  id: number;
  externalId: string;
  category: string;
  severity: string;
  message: string;
  regionName: string;
  issuedAt: string;
  fetchedAt: string;
}

export interface AirQualityReading {
  id: number;
  stationName: string;
  latitude: number | null;
  longitude: number | null;
  pm10: number | null;
  pm25: number | null;
  o3: number | null;
  no2: number | null;
  co: number | null;
  so2: number | null;
  aqi: number | null;
  grade: string;
  measuredAt: string;
  fetchedAt: string;
}

export interface WeatherObservation {
  id: number;
  stationId: string;
  stationName: string;
  latitude: number | null;
  longitude: number | null;
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string;
  precipitation: number | null;
  condition: string;
  observedAt: string;
  fetchedAt: string;
}

export interface Wildfire {
  id: number;
  latitude: number;
  longitude: number;
  brightness: number | null;
  confidence: number | null;
  frp: number | null;
  satellite: string;
  detectedAt: string;
  fetchedAt: string;
}

export interface DashboardSummary {
  earthquakes: { count24h: number };
  disasters: { activeAlerts: number };
  airQuality: { stationsReporting: number };
  weather: { stationsReporting: number };
  wildfires: { activeHotspots: number };
}

export type EntityMetadata =
  | { type: "earthquake"; data: Earthquake }
  | { type: "airQuality"; data: AirQualityReading }
  | { type: "disaster"; data: DisasterAlert }
  | { type: "wildfire"; data: Wildfire }
  | { type: "weather"; data: WeatherObservation };

export default client;
