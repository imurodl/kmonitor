package com.kmonitor.domain.earthquake;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EarthquakeRepository extends JpaRepository<Earthquake, Long> {

    boolean existsByExternalId(String externalId);

    List<Earthquake> findTop50ByOrderByOccurredAtDesc();

    List<Earthquake> findByOccurredAtAfterOrderByOccurredAtDesc(LocalDateTime since);

    long countByOccurredAtAfter(LocalDateTime since);
}
