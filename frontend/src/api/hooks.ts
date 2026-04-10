import { useQuery } from "@tanstack/react-query";
import client from "./client";
import type {
  ApiResponse,
  Earthquake,
  DisasterAlert,
  AirQualityReading,
  WeatherObservation,
  Wildfire,
  DashboardSummary,
} from "./client";

export function useEarthquakes() {
  return useQuery({
    queryKey: ["earthquakes"],
    queryFn: () =>
      client
        .get<ApiResponse<Earthquake[]>>("/earthquakes")
        .then((r) => r.data.data),
    refetchInterval: 30_000,
  });
}

export function useDisasterAlerts() {
  return useQuery({
    queryKey: ["disasters"],
    queryFn: () =>
      client
        .get<ApiResponse<DisasterAlert[]>>("/disasters")
        .then((r) => r.data.data),
    refetchInterval: 30_000,
  });
}

export function useAirQuality() {
  return useQuery({
    queryKey: ["airQuality"],
    queryFn: () =>
      client
        .get<ApiResponse<AirQualityReading[]>>("/air-quality")
        .then((r) => r.data.data),
    refetchInterval: 60_000,
  });
}

export function useWeather() {
  return useQuery({
    queryKey: ["weather"],
    queryFn: () =>
      client
        .get<ApiResponse<WeatherObservation[]>>("/weather")
        .then((r) => r.data.data),
    refetchInterval: 60_000,
  });
}

export function useWildfires() {
  return useQuery({
    queryKey: ["wildfires"],
    queryFn: () =>
      client
        .get<ApiResponse<Wildfire[]>>("/wildfires")
        .then((r) => r.data.data),
    refetchInterval: 60_000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      client
        .get<ApiResponse<DashboardSummary>>("/dashboard/summary")
        .then((r) => r.data.data),
    refetchInterval: 30_000,
  });
}
