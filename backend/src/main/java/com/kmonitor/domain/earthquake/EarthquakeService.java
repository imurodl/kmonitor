package com.kmonitor.domain.earthquake;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EarthquakeService {

    private final EarthquakeRepository repository;

    public List<Earthquake> getRecent() {
        return repository.findTop50ByOrderByOccurredAtDesc();
    }

    public List<Earthquake> getSince(LocalDateTime since) {
        return repository.findByOccurredAtAfterOrderByOccurredAtDesc(since);
    }

    public Optional<Earthquake> getById(Long id) {
        return repository.findById(id);
    }

    public long countLast24h() {
        return repository.countByOccurredAtAfter(LocalDateTime.now().minusDays(1));
    }

    public Earthquake save(Earthquake earthquake) {
        return repository.save(earthquake);
    }

    public boolean existsByExternalId(String externalId) {
        return repository.existsByExternalId(externalId);
    }
}
