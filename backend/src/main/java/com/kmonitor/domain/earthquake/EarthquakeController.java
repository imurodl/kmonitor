package com.kmonitor.domain.earthquake;

import com.kmonitor.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/earthquakes")
@RequiredArgsConstructor
public class EarthquakeController {

    private final EarthquakeService service;

    @GetMapping
    public ApiResponse<List<Earthquake>> getEarthquakes(
            @RequestParam(required = false) LocalDateTime since
    ) {
        List<Earthquake> data = since != null
                ? service.getSince(since)
                : service.getRecent();
        return ApiResponse.of(data, data.size());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Earthquake>> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(eq -> ResponseEntity.ok(ApiResponse.of(eq)))
                .orElse(ResponseEntity.notFound().build());
    }
}
