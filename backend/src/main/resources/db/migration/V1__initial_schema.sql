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
