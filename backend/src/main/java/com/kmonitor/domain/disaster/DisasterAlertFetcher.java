package com.kmonitor.domain.disaster;

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
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DisasterAlertFetcher {

    private final RestClient restClient;
    private final DisasterAlertService service;
    private final ApiKeyProperties apiKeys;
    private final ObjectMapper objectMapper;

    private static final String BASE_URL = "http://apis.data.go.kr/1741000/DisasterMsg4/getDisasterMsg2List";
    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");

    private static final Map<String, String> CATEGORY_KEYWORDS = Map.ofEntries(
            Map.entry("지진", "EARTHQUAKE"),
            Map.entry("태풍", "TYPHOON"),
            Map.entry("호우", "HEAVY_RAIN"),
            Map.entry("대설", "HEAVY_SNOW"),
            Map.entry("한파", "COLD_WAVE"),
            Map.entry("폭염", "HEAT_WAVE"),
            Map.entry("미세먼지", "FINE_DUST"),
            Map.entry("산불", "WILDFIRE"),
            Map.entry("해일", "TSUNAMI"),
            Map.entry("강풍", "STRONG_WIND")
    );

    @Scheduled(fixedRateString = "${kmonitor.fetch.disaster-interval:120000}")
    public void fetch() {
        if (apiKeys.getDataGoKr() == null || apiKeys.getDataGoKr().isBlank()) {
            log.warn("Disaster fetch skipped: DATA_GO_KR_KEY not configured");
            return;
        }

        try {
            String url = BASE_URL
                    + "?serviceKey=" + apiKeys.getDataGoKr()
                    + "&numOfRows=50"
                    + "&pageNo=1"
                    + "&type=json";

            String body = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            parseAndSave(body);
        } catch (Exception e) {
            log.error("Failed to fetch disaster alerts", e);
        }
    }

    private void parseAndSave(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode disasterMsg = root.path("DisasterMsg");

            if (!disasterMsg.isArray() || disasterMsg.size() < 2) {
                log.debug("No disaster alert items in response");
                return;
            }

            JsonNode rows = disasterMsg.get(1).path("row");
            if (!rows.isArray()) return;

            int newCount = 0;
            for (JsonNode row : rows) {
                String externalId = row.path("md101_sn").asText();

                if (service.existsByExternalId(externalId)) continue;

                String message = row.path("msg").asText();

                DisasterAlert alert = DisasterAlert.builder()
                        .externalId(externalId)
                        .message(message)
                        .regionName(row.path("location_name").asText())
                        .category(detectCategory(message))
                        .severity(detectSeverity(message))
                        .issuedAt(parseDateTime(row.path("create_date").asText()))
                        .fetchedAt(LocalDateTime.now())
                        .build();

                service.save(alert);
                newCount++;
            }

            log.info("Disaster fetch: {} items, {} new", rows.size(), newCount);
        } catch (Exception e) {
            log.error("Failed to parse disaster response", e);
        }
    }

    private String detectCategory(String message) {
        for (var entry : CATEGORY_KEYWORDS.entrySet()) {
            if (message.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "OTHER";
    }

    private String detectSeverity(String message) {
        if (message.contains("긴급") || message.contains("대피")) return "CRITICAL";
        if (message.contains("주의") || message.contains("경보")) return "WARNING";
        if (message.contains("해제")) return "INFO";
        return "WARNING";
    }

    private LocalDateTime parseDateTime(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr, DT_FMT);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
