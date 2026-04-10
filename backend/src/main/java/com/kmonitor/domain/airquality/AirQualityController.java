package com.kmonitor.domain.airquality;

import com.kmonitor.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/air-quality")
@RequiredArgsConstructor
public class AirQualityController {

    private final AirQualityService service;

    @GetMapping
    public ApiResponse<List<AirQualityReading>> getLatest() {
        List<AirQualityReading> data = service.getLatest();
        return ApiResponse.of(data, data.size());
    }
}
