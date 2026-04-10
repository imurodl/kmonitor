# K-Monitor Database Entities

## Overview

All entities follow these conventions:
- `id` — auto-generated primary key (BIGSERIAL)
- `external_id` — unique identifier from source API (for dedup)
- `latitude` / `longitude` — stored as DOUBLE PRECISION for easy JSON serialization
- `location` — PostGIS POINT(4326) for future spatial queries
- `fetched_at` — when our fetcher pulled the data
- Timestamps stored as `TIMESTAMP WITHOUT TIME ZONE` (all in KST context)

---

## Entities

### Earthquake
```java
@Entity
@Table(name = "earthquakes", indexes = {
    @Index(name = "idx_eq_external_id", columnList = "externalId", unique = true),
    @Index(name = "idx_eq_occurred_at", columnList = "occurredAt")
})
public class Earthquake {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String externalId;
    
    private Double magnitude;
    private Integer depth;          // km
    private Double latitude;
    private Double longitude;
    private String locationName;    // "경북 경주시 남남서쪽 8km 지역"
    
    @Column(nullable = false)
    private LocalDateTime occurredAt;
    
    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
```

### DisasterAlert
```java
@Entity
@Table(name = "disaster_alerts", indexes = {
    @Index(name = "idx_da_external_id", columnList = "externalId", unique = true),
    @Index(name = "idx_da_issued_at", columnList = "issuedAt")
})
public class DisasterAlert {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String externalId;
    
    private String category;        // 지진, 태풍, 호우, 대설, 한파, 미세먼지, etc.
    private String severity;        // CRITICAL, WARNING, WATCH, INFO
    
    @Column(columnDefinition = "TEXT")
    private String message;         // Full alert text
    
    private String regionName;      // 서울특별시, 경기도, etc.
    
    @Column(nullable = false)
    private LocalDateTime issuedAt;
    
    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
```

### AirQualityReading
```java
@Entity
@Table(name = "air_quality_readings", indexes = {
    @Index(name = "idx_aq_station_measured", columnList = "stationName,measuredAt", unique = true),
    @Index(name = "idx_aq_measured_at", columnList = "measuredAt")
})
public class AirQualityReading {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String stationName;
    
    private Double latitude;
    private Double longitude;
    private Integer pm10;           // ug/m3
    private Integer pm25;           // ug/m3
    private Double o3;              // ppm
    private Double no2;             // ppm
    private Double co;              // ppm
    private Double so2;             // ppm
    private Integer aqi;            // 통합대기환경지수
    private String grade;           // 좋음, 보통, 나쁨, 매우나쁨
    
    @Column(nullable = false)
    private LocalDateTime measuredAt;
    
    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
```

### WeatherObservation
```java
@Entity
@Table(name = "weather_observations", indexes = {
    @Index(name = "idx_wo_station_observed", columnList = "stationId,observedAt", unique = true),
    @Index(name = "idx_wo_observed_at", columnList = "observedAt")
})
public class WeatherObservation {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String stationId;
    
    private String stationName;
    private Double latitude;
    private Double longitude;
    private Double temperature;     // Celsius
    private Integer humidity;       // %
    private Double windSpeed;       // m/s
    private String windDirection;   // 16-point compass
    private Double precipitation;   // mm
    private String condition;       // 맑음, 구름많음, 흐림, 비, 눈
    
    @Column(nullable = false)
    private LocalDateTime observedAt;
    
    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
```

### Wildfire
```java
@Entity
@Table(name = "wildfires", indexes = {
    @Index(name = "idx_wf_detected_at", columnList = "detectedAt"),
    @Index(name = "idx_wf_lat_lng", columnList = "latitude,longitude,detectedAt", unique = true)
})
public class Wildfire {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    private Double latitude;
    private Double longitude;
    private Double brightness;      // Kelvin
    private Integer confidence;     // 0-100
    private Double frp;             // Fire Radiative Power (MW)
    private String satellite;       // MODIS, VIIRS
    
    @Column(nullable = false)
    private LocalDateTime detectedAt;
    
    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
```

### TrafficIncident
```java
@Entity
@Table(name = "traffic_incidents", indexes = {
    @Index(name = "idx_ti_external_id", columnList = "externalId", unique = true),
    @Index(name = "idx_ti_reported_at", columnList = "reportedAt")
})
public class TrafficIncident {
    @Id @GeneratedValue(strategy = IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String externalId;
    
    private String type;            // 사고, 공사, 통제, 행사
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double latitude;
    private Double longitude;
    private String severity;        // HIGH, MEDIUM, LOW
    
    @Column(nullable = false)
    private LocalDateTime reportedAt;
    
    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
```

---

## Flyway Migration: V1__initial_schema.sql

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Earthquakes
CREATE TABLE earthquakes (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    magnitude DOUBLE PRECISION,
    depth INTEGER,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name VARCHAR(500),
    occurred_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_eq_occurred_at ON earthquakes(occurred_at DESC);

-- Disaster Alerts
CREATE TABLE disaster_alerts (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    region_name VARCHAR(200),
    issued_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_da_issued_at ON disaster_alerts(issued_at DESC);

-- Air Quality Readings
CREATE TABLE air_quality_readings (
    id BIGSERIAL PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    pm10 INTEGER,
    pm25 INTEGER,
    o3 DOUBLE PRECISION,
    no2 DOUBLE PRECISION,
    co DOUBLE PRECISION,
    so2 DOUBLE PRECISION,
    aqi INTEGER,
    grade VARCHAR(20),
    measured_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    UNIQUE(station_name, measured_at)
);
CREATE INDEX idx_aq_measured_at ON air_quality_readings(measured_at DESC);

-- Weather Observations
CREATE TABLE weather_observations (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    station_name VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    humidity INTEGER,
    wind_speed DOUBLE PRECISION,
    wind_direction VARCHAR(10),
    precipitation DOUBLE PRECISION,
    condition VARCHAR(50),
    observed_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    UNIQUE(station_id, observed_at)
);
CREATE INDEX idx_wo_observed_at ON weather_observations(observed_at DESC);

-- Wildfires (NASA FIRMS)
CREATE TABLE wildfires (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    brightness DOUBLE PRECISION,
    confidence INTEGER,
    frp DOUBLE PRECISION,
    satellite VARCHAR(20),
    detected_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL,
    UNIQUE(latitude, longitude, detected_at)
);
CREATE INDEX idx_wf_detected_at ON wildfires(detected_at DESC);

-- Traffic Incidents
CREATE TABLE traffic_incidents (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50),
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    severity VARCHAR(20),
    reported_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_ti_reported_at ON traffic_incidents(reported_at DESC);
```

## Index Strategy
- **Primary lookup**: All tables indexed on timestamp DESC (most recent first)
- **Dedup**: Unique constraints on `external_id` or composite keys
- **Future**: Add PostGIS GIST index on geometry columns when spatial queries are needed:
  ```sql
  ALTER TABLE earthquakes ADD COLUMN location geometry(Point, 4326);
  CREATE INDEX idx_eq_location ON earthquakes USING GIST(location);
  ```
