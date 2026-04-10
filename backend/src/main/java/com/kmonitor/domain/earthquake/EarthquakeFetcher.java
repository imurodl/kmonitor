package com.kmonitor.domain.earthquake;

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
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class EarthquakeFetcher {

    private final RestClient restClient;
    private final EarthquakeService service;
    private final ApiKeyProperties apiKeys;
    private final ObjectMapper objectMapper;

    private static final String BASE_URL = "http://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Scheduled(fixedRateString = "${kmonitor.fetch.earthquake-interval:300000}")
    public void fetch() {
        if (apiKeys.getDataGoKr() == null || apiKeys.getDataGoKr().isBlank()) {
            log.warn("Earthquake fetch skipped: DATA_GO_KR_KEY not configured");
            return;
        }

        try {
            String today = LocalDate.now().format(DATE_FMT);
            String thirtyDaysAgo = LocalDate.now().minusDays(30).format(DATE_FMT);

            String url = BASE_URL
                    + "?serviceKey=" + apiKeys.getDataGoKr()
                    + "&numOfRows=50"
                    + "&pageNo=1"
                    + "&dataType=JSON"
                    + "&fromTmFc=" + thirtyDaysAgo
                    + "&toTmFc=" + today;

            String body = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            parseAndSave(body);
        } catch (Exception e) {
            log.error("Failed to fetch earthquake data", e);
        }
    }

    private void parseAndSave(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.path("response").path("body").path("items").path("item");

            if (items.isMissingNode() || !items.isArray()) {
                log.debug("No earthquake items in response");
                return;
            }

            int newCount = 0;
            for (JsonNode item : items) {
                String externalId = item.path("tmFc").asText();

                if (service.existsByExternalId(externalId)) {
                    continue;
                }

                Earthquake eq = Earthquake.builder()
                        .externalId(externalId)
                        .magnitude(parseDouble(item.path("mt").asText()))
                        .depth(parseInt(item.path("dep").asText()))
                        .latitude(parseDouble(item.path("lat").asText()))
                        .longitude(parseDouble(item.path("lon").asText()))
                        .locationName(item.path("loc").asText())
                        .occurredAt(parseDateTime(externalId))
                        .fetchedAt(LocalDateTime.now())
                        .build();

                service.save(eq);
                newCount++;
            }

            log.info("Earthquake fetch: {} items, {} new", items.size(), newCount);
        } catch (Exception e) {
            log.error("Failed to parse earthquake response", e);
        }
    }

    private LocalDateTime parseDateTime(String tmFc) {
        try {
            return LocalDateTime.parse(tmFc, DATETIME_FMT);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (Exception e) {
            return null;
        }
    }
}
