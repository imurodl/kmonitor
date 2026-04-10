package com.kmonitor.domain.airquality;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kmonitor.config.ApiKeyProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AirQualityFetcher {

    private final RestClient restClient;
    private final AirQualityService service;
    private final ApiKeyProperties apiKeys;
    private final ObjectMapper objectMapper;

    private static final String BASE_URL = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // Major 시도 to fetch
    private static final List<String> SIDO_LIST = List.of(
            "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
            "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    );

    // Station coordinates (approximate center of each station area)
    // In production, fetch from getMsrstnList API
    private static final Map<String, double[]> STATION_COORDS = Map.ofEntries(
            Map.entry("종로구", new double[]{37.5720, 126.9659}),
            Map.entry("중구", new double[]{37.5641, 126.9979}),
            Map.entry("용산구", new double[]{37.5326, 126.9909}),
            Map.entry("성동구", new double[]{37.5634, 127.0369}),
            Map.entry("광진구", new double[]{37.5385, 127.0824}),
            Map.entry("동대문구", new double[]{37.5744, 127.0396}),
            Map.entry("중랑구", new double[]{37.6066, 127.0928}),
            Map.entry("성북구", new double[]{37.5894, 127.0167}),
            Map.entry("강북구", new double[]{37.6398, 127.0255}),
            Map.entry("도봉구", new double[]{37.6688, 127.0472}),
            Map.entry("노원구", new double[]{37.6543, 127.0568}),
            Map.entry("은평구", new double[]{37.6027, 126.9291}),
            Map.entry("서대문구", new double[]{37.5791, 126.9368}),
            Map.entry("마포구", new double[]{37.5664, 126.9014}),
            Map.entry("양천구", new double[]{37.5170, 126.8665}),
            Map.entry("강서구", new double[]{37.5510, 126.8495}),
            Map.entry("구로구", new double[]{37.4954, 126.8877}),
            Map.entry("금천구", new double[]{37.4569, 126.8955}),
            Map.entry("영등포구", new double[]{37.5264, 126.8963}),
            Map.entry("동작구", new double[]{37.5124, 126.9393}),
            Map.entry("관악구", new double[]{37.4784, 126.9516}),
            Map.entry("서초구", new double[]{37.4837, 127.0324}),
            Map.entry("강남구", new double[]{37.5172, 127.0473}),
            Map.entry("송파구", new double[]{37.5146, 127.1050}),
            Map.entry("강동구", new double[]{37.5301, 127.1238})
    );

    private static final Map<String, String> GRADE_MAP = Map.of(
            "1", "좋음",
            "2", "보통",
            "3", "나쁨",
            "4", "매우나쁨"
    );

    @Scheduled(fixedRateString = "${kmonitor.fetch.air-quality-interval:1800000}")
    public void fetch() {
        if (apiKeys.getDataGoKr() == null || apiKeys.getDataGoKr().isBlank()) {
            log.warn("Air quality fetch skipped: DATA_GO_KR_KEY not configured");
            return;
        }

        int totalNew = 0;
        for (String sido : SIDO_LIST) {
            try {
                totalNew += fetchSido(sido);
            } catch (Exception e) {
                log.error("Failed to fetch air quality for {}", sido, e);
            }
        }
        log.info("Air quality fetch complete: {} new readings", totalNew);
    }

    private int fetchSido(String sido) throws Exception {
        String url = BASE_URL
                + "?serviceKey=" + apiKeys.getDataGoKr()
                + "&returnType=json"
                + "&numOfRows=200"
                + "&pageNo=1"
                + "&sidoName=" + sido
                + "&ver=1.3";

        String body = restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);

        return parseAndSave(body);
    }

    private int parseAndSave(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode items = root.path("response").path("body").path("items");

        if (items.isMissingNode() || !items.isArray()) return 0;

        int newCount = 0;
        for (JsonNode item : items) {
            String stationName = item.path("stationName").asText();
            LocalDateTime measuredAt = parseDateTime(item.path("dataTime").asText());

            if (service.exists(stationName, measuredAt)) continue;

            double[] coords = STATION_COORDS.getOrDefault(stationName, null);

            AirQualityReading reading = AirQualityReading.builder()
                    .stationName(stationName)
                    .latitude(coords != null ? coords[0] : null)
                    .longitude(coords != null ? coords[1] : null)
                    .pm10(parseInt(item.path("pm10Value").asText()))
                    .pm25(parseInt(item.path("pm25Value").asText()))
                    .o3(parseDouble(item.path("o3Value").asText()))
                    .no2(parseDouble(item.path("no2Value").asText()))
                    .co(parseDouble(item.path("coValue").asText()))
                    .so2(parseDouble(item.path("so2Value").asText()))
                    .aqi(parseInt(item.path("khaiValue").asText()))
                    .grade(GRADE_MAP.getOrDefault(item.path("khaiGrade").asText(), "알수없음"))
                    .measuredAt(measuredAt)
                    .fetchedAt(LocalDateTime.now())
                    .build();

            service.save(reading);
            newCount++;
        }
        return newCount;
    }

    private LocalDateTime parseDateTime(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr, DT_FMT);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private Integer parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return null;
        }
    }
}
