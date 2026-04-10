# K-Monitor REST API Specification

## Base URL
```
http://localhost:8080/api/v1
```

## Response Wrapper
All endpoints return:
```json
{
  "data": [...],
  "timestamp": "2026-04-10T15:30:00",
  "count": 25
}
```

Error responses:
```json
{
  "error": "NOT_FOUND",
  "message": "Earthquake not found with id: 999",
  "timestamp": "2026-04-10T15:30:00"
}
```

---

## Endpoints

### Earthquakes

#### `GET /earthquakes`
Recent earthquakes sorted by occurrence time (desc).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 50 | Max results |
| since | string | - | ISO datetime filter (e.g. `2026-04-01T00:00:00`) |
| minMagnitude | double | - | Minimum magnitude filter |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "externalId": "20260410153000",
      "magnitude": 3.5,
      "depth": 12,
      "latitude": 35.7796,
      "longitude": 129.0756,
      "locationName": "경북 경주시 남남서쪽 8km 지역",
      "occurredAt": "2026-04-10T15:30:00",
      "fetchedAt": "2026-04-10T15:35:00"
    }
  ],
  "timestamp": "2026-04-10T15:35:00",
  "count": 1
}
```

#### `GET /earthquakes/{id}`
Single earthquake detail.

---

### Disaster Alerts

#### `GET /disasters`
Recent disaster alert messages.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 50 | Max results |
| since | string | - | ISO datetime filter |
| category | string | - | Filter: 지진, 태풍, 호우, 대설, 한파, etc. |
| region | string | - | Filter by region name |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "externalId": "MSG_20260410_001",
      "category": "호우",
      "severity": "WARNING",
      "message": "오늘 18시부터 내일 06시까지 서울, 경기북부에 시간당 30mm 이상의 강한 비...",
      "regionName": "서울특별시",
      "issuedAt": "2026-04-10T14:00:00",
      "fetchedAt": "2026-04-10T14:02:00"
    }
  ],
  "timestamp": "2026-04-10T14:02:00",
  "count": 1
}
```

---

### Air Quality

#### `GET /air-quality`
Latest readings from all monitoring stations.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| region | string | - | Filter by 시도 (서울, 부산, etc.) |
| grade | string | - | Filter: 좋음, 보통, 나쁨, 매우나쁨 |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "stationName": "종로구",
      "latitude": 37.5720,
      "longitude": 126.9659,
      "pm10": 45,
      "pm25": 22,
      "o3": 0.035,
      "no2": 0.028,
      "co": 0.5,
      "so2": 0.004,
      "aqi": 63,
      "grade": "보통",
      "measuredAt": "2026-04-10T15:00:00",
      "fetchedAt": "2026-04-10T15:05:00"
    }
  ],
  "timestamp": "2026-04-10T15:05:00",
  "count": 320
}
```

#### `GET /air-quality/stats`
Aggregated air quality statistics.

Response:
```json
{
  "data": {
    "avgPm25": 18,
    "avgPm10": 35,
    "worstStation": "영등포구",
    "worstPm25": 65,
    "goodCount": 180,
    "moderateCount": 100,
    "badCount": 30,
    "veryBadCount": 10,
    "lastUpdated": "2026-04-10T15:00:00"
  },
  "timestamp": "2026-04-10T15:05:00",
  "count": 1
}
```

---

### Weather

#### `GET /weather`
Latest weather observations from stations.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| region | string | - | Filter by region |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "stationName": "서울",
      "stationId": "108",
      "latitude": 37.5714,
      "longitude": 126.9658,
      "temperature": 18.5,
      "humidity": 55,
      "windSpeed": 3.2,
      "windDirection": "SW",
      "precipitation": 0.0,
      "condition": "맑음",
      "observedAt": "2026-04-10T15:00:00",
      "fetchedAt": "2026-04-10T15:15:00"
    }
  ],
  "timestamp": "2026-04-10T15:15:00",
  "count": 95
}
```

---

### Wildfires

#### `GET /wildfires`
Active fire hotspots in Korea (from NASA FIRMS).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| hours | int | 24 | Time window (last N hours) |
| minConfidence | int | - | Minimum confidence percentage |

Response:
```json
{
  "data": [
    {
      "id": 1,
      "latitude": 37.4563,
      "longitude": 128.7321,
      "brightness": 312.5,
      "confidence": 85,
      "frp": 15.3,
      "satellite": "MODIS",
      "detectedAt": "2026-04-10T14:30:00",
      "fetchedAt": "2026-04-10T14:40:00"
    }
  ],
  "timestamp": "2026-04-10T14:40:00",
  "count": 3
}
```

---

### Traffic

#### `GET /traffic`
Current traffic incidents in Seoul.

Response:
```json
{
  "data": [
    {
      "id": 1,
      "externalId": "TOPIS_20260410_001",
      "type": "사고",
      "description": "강남대로 교차로 2중 추돌사고",
      "latitude": 37.4979,
      "longitude": 127.0276,
      "severity": "HIGH",
      "reportedAt": "2026-04-10T14:15:00",
      "fetchedAt": "2026-04-10T14:18:00"
    }
  ],
  "timestamp": "2026-04-10T14:18:00",
  "count": 5
}
```

---

### Dashboard

#### `GET /dashboard/summary`
Combined statistics for dashboard cards.

Response:
```json
{
  "data": {
    "earthquakes": {
      "total24h": 3,
      "maxMagnitude": 3.5,
      "latest": "2026-04-10T15:30:00"
    },
    "disasters": {
      "activeAlerts": 2,
      "latest": "2026-04-10T14:00:00"
    },
    "airQuality": {
      "avgPm25": 18,
      "worstGrade": "나쁨",
      "stationsReporting": 320
    },
    "wildfires": {
      "activeHotspots": 3,
      "latest": "2026-04-10T14:30:00"
    },
    "weather": {
      "avgTemp": 18.5,
      "stationsReporting": 95
    },
    "traffic": {
      "activeIncidents": 5,
      "latest": "2026-04-10T14:15:00"
    }
  },
  "timestamp": "2026-04-10T15:35:00",
  "count": 1
}
```

---

### Health

#### `GET /health`
Data source freshness check.

Response:
```json
{
  "data": {
    "earthquake": { "lastFetch": "2026-04-10T15:35:00", "status": "OK", "recordCount": 150 },
    "disaster": { "lastFetch": "2026-04-10T15:34:00", "status": "OK", "recordCount": 45 },
    "airQuality": { "lastFetch": "2026-04-10T15:05:00", "status": "OK", "recordCount": 320 },
    "weather": { "lastFetch": "2026-04-10T15:15:00", "status": "OK", "recordCount": 95 },
    "wildfire": { "lastFetch": "2026-04-10T15:30:00", "status": "OK", "recordCount": 3 },
    "traffic": { "lastFetch": "2026-04-10T15:33:00", "status": "OK", "recordCount": 5 }
  },
  "timestamp": "2026-04-10T15:35:00",
  "count": 6
}
```
