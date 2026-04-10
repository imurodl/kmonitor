package com.kmonitor.domain.weather;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface WeatherRepository extends JpaRepository<WeatherObservation, Long> {

    boolean existsByStationIdAndObservedAt(String stationId, LocalDateTime observedAt);

    @Query("SELECT w FROM WeatherObservation w WHERE w.observedAt = " +
           "(SELECT MAX(w2.observedAt) FROM WeatherObservation w2 WHERE w2.stationId = w.stationId)")
    List<WeatherObservation> findLatestPerStation();

    long countByObservedAtAfter(LocalDateTime since);
}
