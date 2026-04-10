# KMonitor — Agent Instructions

## Project Context

KMonitor is a Korean disaster situational awareness dashboard. It aggregates real-time data from Korean government APIs and NASA onto a CesiumJS 3D globe.

## Repository Layout

```
kmonitor/
├── backend/          Java 21, Spring Boot 3.5, Gradle
├── frontend/         React 18, TypeScript, Vite, CesiumJS
├── plans/            Architecture and design documentation
├── docker-compose.yml
├── CLAUDE.md         Detailed development instructions
└── .env.example      Required environment variables
```

## Key Design Decisions

- **Domain-sliced backend**: Each data domain (earthquake, disaster, airquality, weather, wildfire) is a self-contained package with Entity, Repository, Service, Controller, and Fetcher classes. Do not refactor into layered architecture.
- **No auth**: This is a public read-only dashboard. Do not add Spring Security or user authentication.
- **No WebSocket**: Frontend polls via TanStack Query `refetchInterval`. This is intentional — external APIs update every 2-30 minutes, so polling is sufficient.
- **No Redis**: PostgreSQL handles the data volume fine. Do not add caching layers.
- **Dedup pattern**: Every fetcher checks `existsByExternalId` (or composite key) before inserting. This prevents duplicates when external APIs return overlapping time windows.

## Coding Standards

### Backend (Java/Spring Boot)
- Use Lombok annotations to reduce boilerplate
- Use Java records for DTOs
- Use `RestClient` (not `WebClient`) for HTTP calls
- Wrap all API responses in `ApiResponse<T>` record
- Log every fetch cycle with counts: `log.info("Fetched {} items, {} new", total, newCount)`
- Handle parse failures gracefully — return null, don't throw

### Frontend (React/TypeScript)
- Functional components only
- TanStack Query for all API calls — no raw fetch/axios in components
- Zustand for UI state (layer toggles)
- Tailwind utility classes — no CSS modules or styled-components
- Each CesiumJS layer is a separate component receiving typed data props

## Testing

- Backend: `cd backend && ./gradlew test`
- Frontend type check: `cd frontend && npx tsc --noEmit`
- Frontend build: `cd frontend && npm run build`
- Full stack: `docker compose up db -d`, then run backend and frontend

## External API Notes

- **data.go.kr**: All APIs need `serviceKey` param. Response nested at `response.body.items.item[]`. Always pass `dataType=JSON`.
- **NASA FIRMS**: Returns CSV. Parse line by line, skip header. Korea bbox: `124,33,132,43`.
- **Rate limits**: data.go.kr gives 10,000 calls/month per API. Fetcher intervals are configured to stay within limits.
