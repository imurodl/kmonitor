package com.kmonitor.domain.weather;

import com.kmonitor.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService service;

    @GetMapping
    public ApiResponse<List<WeatherObservation>> getWeather() {
        List<WeatherObservation> data = service.getLatest();
        return ApiResponse.of(data, data.size());
    }
}
