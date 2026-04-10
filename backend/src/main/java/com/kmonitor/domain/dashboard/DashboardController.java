package com.kmonitor.domain.dashboard;

import com.kmonitor.common.ApiResponse;
import com.kmonitor.domain.airquality.AirQualityService;
import com.kmonitor.domain.disaster.DisasterAlertService;
import com.kmonitor.domain.earthquake.EarthquakeService;
import com.kmonitor.domain.weather.WeatherService;
import com.kmonitor.domain.wildfire.WildfireService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final EarthquakeService earthquakeService;
    private final DisasterAlertService disasterService;
    private final AirQualityService airQualityService;
    private final WeatherService weatherService;
    private final WildfireService wildfireService;

    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getSummary() {
        Map<String, Object> summary = Map.of(
                "earthquakes", Map.of("count24h", earthquakeService.countLast24h()),
                "disasters", Map.of("activeAlerts", disasterService.countActive()),
                "airQuality", Map.of("stationsReporting", airQualityService.countReporting()),
                "weather", Map.of("stationsReporting", weatherService.countReporting()),
                "wildfires", Map.of("activeHotspots", wildfireService.countActive())
        );
        return ApiResponse.of(summary);
    }

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> getHealth() {
        return ApiResponse.of(Map.of("status", "OK"));
    }
}
