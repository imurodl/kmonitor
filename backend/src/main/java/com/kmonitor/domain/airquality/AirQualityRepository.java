package com.kmonitor.domain.airquality;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AirQualityRepository extends JpaRepository<AirQualityReading, Long> {

    boolean existsByStationNameAndMeasuredAt(String stationName, LocalDateTime measuredAt);

    @Query("SELECT a FROM AirQualityReading a WHERE a.measuredAt = " +
           "(SELECT MAX(a2.measuredAt) FROM AirQualityReading a2 WHERE a2.stationName = a.stationName)")
    List<AirQualityReading> findLatestPerStation();

    long countByMeasuredAtAfter(LocalDateTime since);
}
