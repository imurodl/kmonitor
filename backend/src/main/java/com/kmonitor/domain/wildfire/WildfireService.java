package com.kmonitor.domain.wildfire;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WildfireService {

    private final WildfireRepository repository;

    public List<Wildfire> getRecent(int hours) {
        return repository.findByDetectedAtAfterOrderByDetectedAtDesc(
                LocalDateTime.now().minusHours(hours));
    }

    public long countActive() {
        return repository.countByDetectedAtAfter(LocalDateTime.now().minusDays(1));
    }

    public Wildfire save(Wildfire wildfire) {
        return repository.save(wildfire);
    }

    public boolean exists(Double lat, Double lng, LocalDateTime detectedAt) {
        return repository.existsByLatitudeAndLongitudeAndDetectedAt(lat, lng, detectedAt);
    }
}
