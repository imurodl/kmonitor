# K-Monitor Setup Guide

## Prerequisites

- Java 21 (OpenJDK / Temurin)
- Node.js 20+
- Docker & Docker Compose
- Git

## API Keys Required

### 1. data.go.kr (공공데이터포털)
1. Go to https://www.data.go.kr
2. Sign up / login
3. Search and apply for these APIs (auto-approved):
   - 기상청_지진정보 (EqkInfoService)
   - 행정안전부_재난문자 (DisasterMsg)
   - 한국환경공단_에어코리아_대기오염정보
   - 기상청_단기예보 (VilageFcstInfoService)
4. Copy the "일반 인증키 (Encoding)" from My Page

### 2. Cesium Ion Token
1. Go to https://ion.cesium.com
2. Create free account
3. Go to Access Tokens → copy default token

### 3. NASA FIRMS (optional)
- No auth needed for basic CSV endpoint
- For higher rate limits: https://firms.modaps.eosdis.nasa.gov/api/area/

## Quick Start

### 1. Clone and configure
```bash
git clone https://github.com/imurodl/k-monitor.git
cd k-monitor
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
# Backend starts at http://localhost:8080
# Check: curl http://localhost:8080/api/v1/health
```

### 4. Run frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

### 5. Or run everything with Docker
```bash
docker compose up --build
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

## Environment Variables (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmonitor
DB_USER=kmonitor
DB_PASS=kmonitor

# data.go.kr API key (same key works for all data.go.kr APIs)
DATA_GO_KR_KEY=your_encoding_key_here

# Cesium Ion
VITE_CESIUM_ION_TOKEN=your_cesium_token_here

# Optional: Seoul TOPIS
TOPIS_KEY=your_topis_key_here
```

## Development

### Backend
```bash
cd backend
./gradlew bootRun                    # Run with hot reload
./gradlew test                       # Run tests
./gradlew build                      # Build JAR
```

### Frontend
```bash
cd frontend
npm run dev                          # Dev server with HMR
npm run build                        # Production build
npm run preview                      # Preview production build
npm run lint                         # ESLint check
```

### Docker
```bash
docker compose up --build            # Build and start all
docker compose up db -d              # Just database
docker compose down                  # Stop all
docker compose down -v               # Stop and remove volumes
```

## Troubleshooting

### Backend can't connect to DB
- Make sure PostGIS container is running: `docker compose ps`
- Check logs: `docker compose logs db`
- Verify port 5432 is not occupied by local PostgreSQL

### Cesium globe shows blank/error
- Check browser console for token errors
- Verify `VITE_CESIUM_ION_TOKEN` is set in `.env`
- Try clearing browser cache

### data.go.kr API returns error
- Check if API key is URL-encoded properly
- Verify the API is activated in your data.go.kr account
- Some APIs take up to 1 hour to activate after approval
- Test with curl first:
  ```bash
  curl "http://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg?serviceKey=YOUR_KEY&numOfRows=10&pageNo=1&dataType=JSON"
  ```
