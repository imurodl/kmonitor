package com.kmonitor.domain.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kmonitor.config.ApiKeyProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeatherFetcher {

    private final RestClient restClient;
    private final WeatherService service;
    private final ApiKeyProperties apiKeys;
    private final ObjectMapper objectMapper;

    private static final String BASE_URL = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HHmm");

    // City → {name, nx, ny, lat, lng}
    private record CityInfo(String name, int nx, int ny, double lat, double lng) {}

    private static final List<CityInfo> CITIES = List.of(
            new CityInfo("서울", 60, 127, 37.5665, 126.9780),
            new CityInfo("부산", 98, 76, 35.1796, 129.0756),
            new CityInfo("대구", 89, 90, 35.8714, 128.6014),
            new CityInfo("인천", 55, 124, 37.4563, 126.7052),
            new CityInfo("광주", 58, 74, 35.1595, 126.8526),
            new CityInfo("대전", 67, 100, 36.3504, 127.3845),
            new CityInfo("울산", 102, 84, 35.5384, 129.3114),
            new CityInfo("세종", 66, 103, 36.4801, 127.2561),
            new CityInfo("제주", 52, 38, 33.4996, 126.5312),
            new CityInfo("수원", 60, 121, 37.2636, 127.0286),
            new CityInfo("춘천", 73, 134, 37.8813, 127.7298),
            new CityInfo("청주", 69, 106, 36.6424, 127.4890),
            new CityInfo("전주", 63, 89, 35.8242, 127.1480),
            new CityInfo("포항", 102, 94, 36.0190, 129.3435),
            new CityInfo("창원", 90, 77, 35.2270, 128.6811),
            new CityInfo("강릉", 92, 131, 37.7519, 128.8761)
    );

    private static final Map<String, String> SKY_MAP = Map.of(
            "1", "맑음", "3", "구름많음", "4", "흐림"
    );

    private static final Map<String, String> PTY_MAP = Map.of(
            "0", "", "1", "비", "2", "비/눈", "3", "눈",
            "5", "빗방울", "6", "진눈깨비", "7", "눈날림"
    );

    @Scheduled(fixedRateString = "${kmonitor.fetch.weather-interval:900000}")
    public void fetch() {
        if (apiKeys.getDataGoKr() == null || apiKeys.getDataGoKr().isBlank()) {
            log.warn("Weather fetch skipped: DATA_GO_KR_KEY not configured");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        // Base time: round down to nearest hour
        String baseDate = now.format(DATE_FMT);
        String baseTime = String.format("%02d00", now.getHour() > 0 ? now.getHour() - 1 : 23);

        int totalNew = 0;
        for (CityInfo city : CITIES) {
            try {
                totalNew += fetchCity(city, baseDate, baseTime, now);
            } catch (Exception e) {
                log.error("Failed to fetch weather for {}", city.name(), e);
            }
        }
        log.info("Weather fetch complete: {} new observations", totalNew);
    }

    private int fetchCity(CityInfo city, String baseDate, String baseTime, LocalDateTime observedAt) throws Exception {
        String url = BASE_URL
                + "?serviceKey=" + apiKeys.getDataGoKr()
                + "&numOfRows=10"
                + "&pageNo=1"
                + "&dataType=JSON"
                + "&base_date=" + baseDate
                + "&base_time=" + baseTime
                + "&nx=" + city.nx()
                + "&ny=" + city.ny();

        String body = restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);

        return parseAndSave(body, city, observedAt);
    }

    private int parseAndSave(String json, CityInfo city, LocalDateTime observedAt) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode items = root.path("response").path("body").path("items").path("item");

        if (items.isMissingNode() || !items.isArray()) return 0;

        // Parse categories into a map
        Map<String, String> values = new HashMap<>();
        for (JsonNode item : items) {
            values.put(item.path("category").asText(), item.path("obsrValue").asText());
        }

        // Round to hour for dedup
        LocalDateTime hourTime = observedAt.withMinute(0).withSecond(0).withNano(0);

        if (service.exists(city.name(), hourTime)) return 0;

        String pty = PTY_MAP.getOrDefault(values.getOrDefault("PTY", "0"), "");
        String condition = pty.isEmpty() ? "맑음" : pty; // Simplified: use precipitation type as condition

        WeatherObservation obs = WeatherObservation.builder()
                .stationId(city.name())
                .stationName(city.name())
                .latitude(city.lat())
                .longitude(city.lng())
                .temperature(parseDouble(values.get("T1H")))
                .humidity(parseInt(values.get("REH")))
                .windSpeed(parseDouble(values.get("WSD")))
                .windDirection(values.get("VEC"))
                .precipitation(parseDouble(values.get("RN1")))
                .condition(condition)
                .observedAt(hourTime)
                .fetchedAt(LocalDateTime.now())
                .build();

        service.save(obs);
        return 1;
    }

    private Double parseDouble(String value) {
        try { return Double.parseDouble(value); }
        catch (Exception e) { return null; }
    }

    private Integer parseInt(String value) {
        try { return Integer.parseInt(value); }
        catch (Exception e) { return null; }
    }
}
