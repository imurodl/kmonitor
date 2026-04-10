package com.kmonitor.domain.weather;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final WeatherRepository repository;

    public List<WeatherObservation> getLatest() {
        return repository.findLatestPerStation();
    }

    public long countReporting() {
        return repository.countByObservedAtAfter(LocalDateTime.now().minusHours(2));
    }

    public WeatherObservation save(WeatherObservation obs) {
        return repository.save(obs);
    }

    public boolean exists(String stationId, LocalDateTime observedAt) {
        return repository.existsByStationIdAndObservedAt(stationId, observedAt);
    }
}
