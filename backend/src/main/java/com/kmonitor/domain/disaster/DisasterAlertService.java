package com.kmonitor.domain.disaster;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DisasterAlertService {

    private final DisasterAlertRepository repository;

    public List<DisasterAlert> getRecent() {
        return repository.findTop50ByOrderByIssuedAtDesc();
    }

    public List<DisasterAlert> getSince(LocalDateTime since) {
        return repository.findByIssuedAtAfterOrderByIssuedAtDesc(since);
    }

    public long countActive() {
        return repository.countByIssuedAtAfter(LocalDateTime.now().minusDays(1));
    }

    public DisasterAlert save(DisasterAlert alert) {
        return repository.save(alert);
    }

    public boolean existsByExternalId(String externalId) {
        return repository.existsByExternalId(externalId);
    }
}
