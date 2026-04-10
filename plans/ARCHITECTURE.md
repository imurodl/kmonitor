# K-Monitor Architecture

## System Overview

```
                        External Data Sources
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │  기상청   │ 행정안전부 │ 에어코리아 │  NASA    │  TOPIS   │
    │ 지진 API  │ 재난문자   │ 미세먼지   │ FIRMS    │ 교통정보  │
    └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘
         │          │          │          │          │
         ▼          ▼          ▼          ▼          ▼
    ┌─────────────────────────────────────────────────────┐
    │              Spring Boot Backend                     │
    │                                                      │
    │  ┌─────────────────────────────────────────────┐     │
    │  │         @Scheduled Fetchers                  │     │
    │  │  EarthquakeFetcher  (5 min)                  │     │
    │  │  DisasterAlertFetcher (2 min)                │     │
    │  │  AirQualityFetcher (30 min)                  │     │
    │  │  WeatherFetcher (15 min)                     │     │
    │  │  WildfireFetcher (10 min)                    │     │
    │  │  TrafficFetcher (3 min)                      │     │
    │  └──────────────┬──────────────────────────────┘     │
    │                 │ parse, dedup, save                  │
    │                 ▼                                     │
    │  ┌──────────────────────────────────────────┐        │
    │  │           JPA Repositories                │        │
    │  │     (existsByExternalId → save)            │        │
    │  └──────────────┬───────────────────────────┘        │
    │                 │                                     │
    │                 ▼                                     │
    │  ┌──────────────────────────────────────────┐        │
    │  │      PostgreSQL + PostGIS                 │        │
    │  │  earthquakes | disaster_alerts            │        │
    │  │  air_quality_readings | weather           │        │
    │  │  wildfires | traffic_incidents             │        │
    │  └──────────────┬───────────────────────────┘        │
    │                 │                                     │
    │                 ▼                                     │
    │  ┌──────────────────────────────────────────┐        │
    │  │   REST Controllers (/api/v1/*)            │        │
    │  │   → Service → Repository → DTO → JSON     │        │
    │  └──────────────┬───────────────────────────┘        │
    │                 │                                     │
    └─────────────────┼───────────────────────────────────┘
                      │ HTTP GET (polled every 30s)
                      ▼
    ┌─────────────────────────────────────────────────────┐
    │              React Frontend                          │
    │                                                      │
    │  ┌────────────────┐  ┌───────────────────────────┐  │
    │  │ TanStack Query  │  │     Zustand Store         │  │
    │  │ (auto-refetch)  │  │  (layer toggle state)     │  │
    │  └───────┬────────┘  └───────────┬───────────────┘  │
    │          │                       │                   │
    │          ▼                       ▼                   │
    │  ┌──────────────────────────────────────────┐       │
    │  │         Resium / CesiumJS                 │       │
    │  │    3D Globe with Korea Terrain            │       │
    │  │                                           │       │
    │  │  Layers:                                  │       │
    │  │   [x] Earthquakes (pulsing circles)       │       │
    │  │   [x] Air Quality (color-coded dots)      │       │
    │  │   [x] Disaster Alerts (warning icons)     │       │
    │  │   [x] Wildfires (fire hotspots)           │       │
    │  │   [x] Weather (condition icons)           │       │
    │  │   [x] Traffic (incident markers)          │       │
    │  └──────────────────────────────────────────┘       │
    │                                                      │
    │  ┌──────────────────────────────────────────┐       │
    │  │         Dashboard Panels                  │       │
    │  │  AlertsFeed | StatsCards | AQI Chart      │       │
    │  └──────────────────────────────────────────┘       │
    └─────────────────────────────────────────────────────┘
```

## Tech Stack Rationale

### Why Spring Boot?
- Industry standard for Korean enterprise/government projects
- JBT uses Java/Spring — this demonstrates domain competence
- Domain-sliced package structure maps directly from NestJS modules
- Spring's `@Scheduled` + `RestClient` handles all data fetching needs

### Why CesiumJS?
- JBT requires Cesium experience for digital twin work
- True 3D globe with terrain, not flat maps
- Handles geospatial data natively (GeoJSON, KML, CZML)
- Resium provides clean React integration

### Why PostgreSQL + PostGIS?
- Spatial data storage and queries
- Standard in GIS industry
- Future: spatial queries like "all events within 50km of Seoul"
- Flyway migrations for schema versioning

### Why No WebSocket?
- TanStack Query polling every 30s is sufficient for this data refresh rate
- External APIs update every 2-30 minutes anyway
- Eliminates complexity for a 2-day build
- Can add SSE/WebSocket in v2 if needed

## Domain Package Pattern

Each domain follows the same structure (NestJS module equivalent):

```
domain/earthquake/
├── Earthquake.java           # @Entity — JPA entity
├── EarthquakeRepository.java # JpaRepository — data access
├── EarthquakeService.java    # @Service — business logic
├── EarthquakeController.java # @RestController — HTTP endpoints
├── EarthquakeFetcher.java    # @Component + @Scheduled — external API fetch
└── dto/
    └── EarthquakeResponse.java  # API response DTO
```

This maps 1:1 from NestJS:
| NestJS | Spring Boot |
|--------|-------------|
| `@Module()` | Package (domain folder) |
| `@Controller()` | `@RestController` |
| `@Injectable()` service | `@Service` |
| `@Injectable()` repository | `JpaRepository<T, ID>` |
| `@Cron()` | `@Scheduled(fixedRate=...)` |
| DTOs | Java records |
