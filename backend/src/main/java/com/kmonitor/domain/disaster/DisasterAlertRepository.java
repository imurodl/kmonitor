package com.kmonitor.domain.disaster;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface DisasterAlertRepository extends JpaRepository<DisasterAlert, Long> {

    boolean existsByExternalId(String externalId);

    List<DisasterAlert> findTop50ByOrderByIssuedAtDesc();

    List<DisasterAlert> findByIssuedAtAfterOrderByIssuedAtDesc(LocalDateTime since);

    long countByIssuedAtAfter(LocalDateTime since);
}
