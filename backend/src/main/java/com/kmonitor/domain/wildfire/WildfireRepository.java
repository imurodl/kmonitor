package com.kmonitor.domain.wildfire;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WildfireRepository extends JpaRepository<Wildfire, Long> {

    boolean existsByLatitudeAndLongitudeAndDetectedAt(Double latitude, Double longitude, LocalDateTime detectedAt);

    List<Wildfire> findByDetectedAtAfterOrderByDetectedAtDesc(LocalDateTime since);

    long countByDetectedAtAfter(LocalDateTime since);
}
