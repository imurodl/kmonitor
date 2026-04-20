/**
 * Single source of truth for data-layer colors.
 * Chrome accents live in index.css theme tokens (chrome-accent).
 */

export const LAYER_COLOR: Record<
  "earthquake" | "airQuality" | "disaster" | "wildfire" | "weather",
  string
> = {
  earthquake: "#ef4444",
  airQuality: "#22c55e",
  disaster: "#f59e0b",
  wildfire: "#ff6b35",
  weather: "#3b82f6",
};

/** Korean AQI tiers — 좋음 / 보통 / 나쁨 / 매우나쁨. */
export const AQI_TIER = {
  good: { label: "좋음", color: "#3b82f6" },
  moderate: { label: "보통", color: "#22c55e" },
  unhealthy: { label: "나쁨", color: "#f59e0b" },
  hazardous: { label: "매우나쁨", color: "#ef4444" },
} as const;

export const AQI_TIERS = [
  AQI_TIER.good,
  AQI_TIER.moderate,
  AQI_TIER.unhealthy,
  AQI_TIER.hazardous,
];

/** Earthquake magnitude scale, stepwise. */
export const MAGNITUDE_TIERS = [
  { label: "< 3.0", color: "#facc15", size: 6 },
  { label: "3.0 – 4.0", color: "#f59e0b", size: 9 },
  { label: "4.0 – 5.0", color: "#ef4444", size: 13 },
  { label: "≥ 5.0", color: "#991b1b", size: 18 },
];

/** Fire confidence tiers (NASA FIRMS). */
export const FIRE_TIERS = [
  { label: "낮음", color: "#fca5a5" },
  { label: "보통", color: "#fb923c" },
  { label: "높음", color: "#ff6b35" },
];
