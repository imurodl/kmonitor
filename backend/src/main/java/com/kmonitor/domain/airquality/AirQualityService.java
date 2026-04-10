package com.kmonitor.domain.airquality;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AirQualityService {

    private final AirQualityRepository repository;

    public List<AirQualityReading> getLatest() {
        return repository.findLatestPerStation();
    }

    public long countReporting() {
        return repository.countByMeasuredAtAfter(LocalDateTime.now().minusHours(2));
    }

    public AirQualityReading save(AirQualityReading reading) {
        return repository.save(reading);
    }

    public boolean exists(String stationName, LocalDateTime measuredAt) {
        return repository.existsByStationNameAndMeasuredAt(stationName, measuredAt);
    }
}
