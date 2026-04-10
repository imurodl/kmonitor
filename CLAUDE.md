# KMonitor — Claude Code Instructions

## Project Overview

KMonitor is a Korean disaster situational awareness dashboard. Spring Boot backend fetches data from Korean public APIs (data.go.kr, NASA FIRMS) on scheduled intervals, stores in PostgreSQL, and serves via REST. React frontend renders data on a CesiumJS 3D globe.

## Architecture

- **Backend**: Spring Boot 3.5, Java 21, Gradle, domain-sliced packages
- **Frontend**: React 18, TypeScript, Vite, Resium (CesiumJS), TanStack Query, Zustand, Tailwind
- **Database**: PostgreSQL 17 with Flyway migrations
- **Dev**: Docker Compose for PostgreSQL on port 5434

## Backend Conventions

- Domain-sliced packages under `com.kmonitor.domain.*` (not layered)
- Each domain: `Entity.java`, `Repository.java`, `Service.java`, `Controller.java`, `Fetcher.java`
- All REST endpoints under `/api/v1/`
- Response wrapper: `ApiResponse<T>` record with `data`, `timestamp`, `count`
- Fetchers use `@Scheduled` with configurable intervals via `application.properties`
- Dedup external data via `existsByExternalId` before saving
- Use Lombok (`@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor`)
- Use Spring's `RestClient` for HTTP calls (not WebClient)
- Flyway migrations in `src/main/resources/db/migration/`

## Frontend Conventions

- Globe component: `src/components/globe/KoreaGlobe.tsx`
- Each data layer is a separate component in `src/components/globe/layers/`
- API hooks in `src/api/hooks.ts` using TanStack Query with `refetchInterval`
- Layer visibility state in Zustand store `src/stores/layerStore.ts`
- Types in `src/api/client.ts`
- Dark theme: bg `#0a0e1a`, card `#111827`, border `#1e293b`, accent `#3b82f6`
- Tailwind for styling, no CSS modules

## Commands

```bash
# Backend
cd backend && ./gradlew bootRun        # Run (port 8080)
cd backend && ./gradlew compileJava    # Compile check
cd backend && ./gradlew test           # Tests

# Frontend
cd frontend && npm run dev             # Dev server (port 5173)
cd frontend && npx tsc --noEmit        # Type check
cd frontend && npm run build           # Production build

# Database
docker compose up db -d                # Start PostgreSQL (port 5434)
```

## Adding a New Data Layer

1. **Backend**: Create new domain package under `com.kmonitor.domain.newlayer/`
   - Entity with `@Entity`, dedup field (`externalId` or composite unique)
   - Repository extending `JpaRepository`
   - Service with CRUD + exists check
   - Controller at `/api/v1/newlayer`
   - Fetcher with `@Scheduled` calling external API
2. **Migration**: Add table to new Flyway migration `V2__add_newlayer.sql`
3. **Frontend**: 
   - Add types to `src/api/client.ts`
   - Add hook to `src/api/hooks.ts`
   - Create layer component in `src/components/globe/layers/`
   - Add to `KoreaGlobe.tsx` conditional rendering
   - Add toggle to `src/stores/layerStore.ts` and `Sidebar.tsx`

## Important Notes

- data.go.kr APIs return nested JSON: `response.body.items.item[]`
- Pass `&dataType=JSON` or `&type=json` to avoid XML responses
- NASA FIRMS returns CSV, not JSON
- Cesium Ion token required for terrain rendering
- Vite proxy forwards `/api` to backend at port 8080
- PostgreSQL Docker runs on port 5434 (not 5432, to avoid local conflicts)
