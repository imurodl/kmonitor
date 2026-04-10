# KMonitor

Real-time Korean disaster situational awareness dashboard built with Spring Boot, React, and CesiumJS.

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-green?logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![CesiumJS](https://img.shields.io/badge/CesiumJS-3D_Globe-orange)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow)

## What It Does

KMonitor aggregates Korean disaster and environmental data from public APIs onto an interactive 3D globe. It provides real-time situational awareness for earthquakes, air quality, disaster alerts, wildfires, and weather across South Korea.

### Data Sources

| Source | Provider | Update Interval |
|--------|----------|-----------------|
| Earthquakes | 기상청 (KMA) | Every 5 min |
| Disaster Alerts | 행정안전부 (MOIS) | Every 2 min |
| Air Quality | 에어코리아 (AirKorea) | Every 30 min |
| Weather | 기상청 단기예보 (KMA) | Every 15 min |
| Wildfires | NASA FIRMS | Every 10 min |

### Features

- 3D CesiumJS globe centered on Korea with terrain
- 5 toggleable data layers with distinct visual styles
- Auto-refreshing dashboard with live stats
- Disaster alert feed with severity classification
- Dark theme command-center UI
- Spring Boot REST API with scheduled data fetchers
- PostgreSQL with Flyway migrations
- Docker Compose for local development

## Tech Stack

**Backend:** Java 21, Spring Boot 3.5, Spring Data JPA, PostgreSQL, Flyway, Lombok

**Frontend:** React 18, TypeScript, Vite, CesiumJS (Resium), TanStack Query, Zustand, Tailwind CSS, Recharts

**Infrastructure:** Docker Compose, GitHub Actions

## Quick Start

### Prerequisites

- Java 21+
- Node.js 20+
- Docker

### 1. Clone and configure

```bash
git clone https://github.com/imurodl/kmonitor.git
cd kmonitor
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start database

```bash
docker compose up db -d
```

### 3. Run backend

```bash
cd backend
./gradlew bootRun
# http://localhost:8080
```

### 4. Run frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## API Keys

| Key | Where to Get | Required |
|-----|-------------|----------|
| `DATA_GO_KR_KEY` | [data.go.kr](https://www.data.go.kr) | Yes |
| `VITE_CESIUM_ION_TOKEN` | [cesium.com/ion](https://ion.cesium.com) | Yes |
| `FIRMS_MAP_KEY` | [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/api/) | For wildfires |

## API Endpoints

```
GET /api/v1/earthquakes        — Recent earthquakes
GET /api/v1/disasters          — Disaster alert messages
GET /api/v1/air-quality        — Latest air quality per station
GET /api/v1/weather            — Latest weather observations
GET /api/v1/wildfires          — Active fire hotspots
GET /api/v1/dashboard/summary  — Aggregated stats
GET /api/v1/dashboard/health   — Data source status
```

## Project Structure

```
kmonitor/
├── backend/                    Spring Boot
│   └── src/main/java/com/kmonitor/
│       ├── config/             CORS, RestClient, API keys
│       ├── domain/
│       │   ├── earthquake/     Entity, Repo, Service, Controller, Fetcher
│       │   ├── disaster/
│       │   ├── airquality/
│       │   ├── weather/
│       │   ├── wildfire/
│       │   └── dashboard/
│       └── common/             ApiResponse, GlobalExceptionHandler
├── frontend/                   React + Vite + CesiumJS
│   └── src/
│       ├── api/                Client, hooks, types
│       ├── components/
│       │   ├── globe/          3D globe + layer components
│       │   └── layout/         Dashboard shell + sidebar
│       └── stores/             Zustand state
├── plans/                      Architecture and design docs
├── docker-compose.yml
└── .env.example
```

## Architecture

```
External APIs → @Scheduled Fetchers → PostgreSQL (dedup)
                                          ↓
                                    REST Controllers → JSON
                                          ↓
                              TanStack Query (30s poll) → CesiumJS Globe
```

Each backend domain follows the same pattern: Entity → Repository → Service → Controller → Fetcher. This maps directly from NestJS module patterns to Spring Boot.

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
