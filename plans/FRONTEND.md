# K-Monitor Frontend Design

## Component Tree

```
App
├── QueryClientProvider (TanStack Query)
├── DashboardLayout
│   ├── Header
│   │   ├── Logo ("K-Monitor")
│   │   ├── KoreanClock (live KST time)
│   │   └── DataSourceStatus (green/yellow/red dots)
│   │
│   ├── Sidebar (left, collapsible)
│   │   ├── LayerToggle
│   │   │   ├── Checkbox: Earthquakes
│   │   │   ├── Checkbox: Air Quality
│   │   │   ├── Checkbox: Disaster Alerts
│   │   │   ├── Checkbox: Wildfires
│   │   │   ├── Checkbox: Weather
│   │   │   └── Checkbox: Traffic
│   │   │
│   │   ├── AlertsFeed
│   │   │   └── AlertItem[] (scrolling, newest first)
│   │   │
│   │   └── StatsPanel
│   │       ├── StatCard: Earthquakes (24h count + max magnitude)
│   │       ├── StatCard: Air Quality (avg PM2.5 + worst station)
│   │       ├── StatCard: Active Alerts
│   │       ├── StatCard: Active Fires
│   │       └── StatCard: Traffic Incidents
│   │
│   ├── MainContent (fills remaining space)
│   │   └── KoreaGlobe
│   │       ├── EarthquakeLayer
│   │       ├── AirQualityLayer
│   │       ├── DisasterAlertLayer
│   │       ├── WildfireLayer
│   │       ├── WeatherLayer
│   │       └── TrafficLayer
│   │
│   └── BottomBar (optional)
│       └── AirQualityChart (sparkline, last 24h PM2.5 trend)
```

## CesiumJS Layer Strategy

### Globe Setup (KoreaGlobe.tsx)
```tsx
<Viewer
  full
  animation={false}
  timeline={false}
  baseLayerPicker={false}
  geocoder={false}
  homeButton={false}
  sceneModePicker={false}
  navigationHelpButton={false}
>
  {/* Dark basemap */}
  <ImageryLayer imageryProvider={/* Mapbox Dark or Cesium Dark */} />
  
  {/* Camera: Korea centered */}
  <CameraFlyTo
    destination={Cartesian3.fromDegrees(127.5, 36.0, 800000)}
    duration={0}
  />
  
  {/* Conditional layers */}
  {layers.earthquake && <EarthquakeLayer data={earthquakes} />}
  {layers.airQuality && <AirQualityLayer data={airQuality} />}
  ...
</Viewer>
```

### Layer Visual Design

| Layer | Primitive | Visual | Interaction |
|-------|-----------|--------|-------------|
| **Earthquake** | Entity + EllipseGraphics | Pulsing red-orange circles. Radius = magnitude * 15000m. Opacity fades with age. | Click → popup with magnitude, depth, location, time |
| **Air Quality** | PointPrimitiveCollection | Color-coded dots at stations. Green (좋음) → Yellow (보통) → Orange (나쁨) → Red (매우나쁨). Size 10px. | Hover → station name + PM2.5 value |
| **Disaster Alert** | Entity + BillboardGraphics | Warning triangle icon (⚠️). Red for CRITICAL, amber for WARNING, blue for INFO. | Click → full alert message text |
| **Wildfire** | Entity + PointGraphics | Orange-red dots with glow. Size proportional to confidence. | Click → satellite, brightness, FRP, time |
| **Weather** | Entity + BillboardGraphics | Weather condition icons (☀️☁️🌧️❄️). Small text label with temp. | Click → full observation details |
| **Traffic** | Entity + PointGraphics | Red dots for 사고, orange for 공사, blue for 통제. | Click → incident description |

### Color Schemes

```typescript
// Air Quality Index colors
const AQI_COLORS = {
  '좋음':    '#22c55e',  // green-500
  '보통':    '#eab308',  // yellow-500
  '나쁨':    '#f97316',  // orange-500
  '매우나쁨': '#ef4444',  // red-500
} as const;

// Earthquake magnitude colors
const MAGNITUDE_COLORS = {
  minor: '#fbbf24',    // < 3.0, amber
  light: '#f97316',    // 3.0-4.0, orange
  moderate: '#ef4444', // 4.0-5.0, red
  strong: '#dc2626',   // 5.0+, dark red
} as const;

// Severity colors (disasters, traffic)
const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  WARNING: '#f59e0b',
  WATCH: '#3b82f6',
  INFO: '#6b7280',
} as const;

// Dashboard theme
const THEME = {
  bg: '#0a0e1a',
  card: '#111827',
  cardBorder: '#1e293b',
  text: '#e5e7eb',
  textMuted: '#9ca3af',
  accent: '#3b82f6',
  accentGlow: 'rgba(59, 130, 246, 0.3)',
} as const;
```

## State Management

### Zustand Store: Layer Visibility
```typescript
interface LayerStore {
  layers: {
    earthquake: boolean;
    airQuality: boolean;
    disaster: boolean;
    wildfire: boolean;
    weather: boolean;
    traffic: boolean;
  };
  toggleLayer: (layer: keyof LayerStore['layers']) => void;
  setAllLayers: (visible: boolean) => void;
}
```

### TanStack Query Hooks
```typescript
// Each hook auto-refreshes on interval
useEarthquakes()        // refetchInterval: 30_000 (30s)
useDisasterAlerts()     // refetchInterval: 30_000
useAirQuality()         // refetchInterval: 60_000 (1min)
useWeather()            // refetchInterval: 60_000
useWildfires()          // refetchInterval: 60_000
useTrafficIncidents()   // refetchInterval: 30_000
useDashboardSummary()   // refetchInterval: 30_000
useHealthStatus()       // refetchInterval: 60_000
```

## Responsive Layout

```
Desktop (> 1024px):
┌──────────────────────────────────────────────────┐
│ Header: Logo | Clock | Data Status               │
├────────────┬─────────────────────────────────────┤
│            │                                      │
│  Sidebar   │         3D Globe (CesiumJS)          │
│  300px     │         fills remaining space        │
│            │                                      │
│ - Layers   │                                      │
│ - Alerts   │                                      │
│ - Stats    │                                      │
│            │                                      │
├────────────┴─────────────────────────────────────┤
│ Bottom Bar: AQI Chart (optional)                  │
└──────────────────────────────────────────────────┘

Mobile (< 1024px):
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│                     │
│    3D Globe         │
│    (full width)     │
│                     │
├─────────────────────┤
│ Tabs: Layers|Alerts │
│ Stats               │
│ Content             │
└─────────────────────┘
```

## Key Dependencies
```json
{
  "react": "^18.3",
  "resium": "^1.18",
  "cesium": "^1.120",
  "@tanstack/react-query": "^5",
  "zustand": "^5",
  "recharts": "^2.12",
  "tailwindcss": "^3.4",
  "axios": "^1.7",
  "date-fns": "^3",
  "vite-plugin-cesium": "^1.2",
  "lucide-react": "^0.400"
}
```
