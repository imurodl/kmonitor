package com.kmonitor.domain.wildfire;

import com.kmonitor.config.ApiKeyProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.io.BufferedReader;
import java.io.StringReader;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class WildfireFetcher {

    private final RestClient restClient;
    private final WildfireService service;
    private final ApiKeyProperties apiKeys;

    // Korea bounding box: west,south,east,north
    private static final String AREA_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv/%s/MODIS_NRT/124,33,132,43/1";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Scheduled(fixedRateString = "${kmonitor.fetch.wildfire-interval:600000}")
    public void fetch() {
        String mapKey = apiKeys.getFirms();

        // Use default public key if not configured
        if (mapKey == null || mapKey.isBlank()) {
            log.warn("Wildfire fetch skipped: FIRMS_MAP_KEY not configured");
            return;
        }

        try {
            String url = String.format(AREA_URL, mapKey);

            String csv = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            parseAndSave(csv);
        } catch (Exception e) {
            log.error("Failed to fetch wildfire data", e);
        }
    }

    private void parseAndSave(String csv) {
        try {
            BufferedReader reader = new BufferedReader(new StringReader(csv));
            String header = reader.readLine(); // skip header
            if (header == null) return;

            int newCount = 0;
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length < 13) continue;

                Double lat = parseDouble(parts[0]);
                Double lng = parseDouble(parts[1]);
                LocalDateTime detectedAt = parseDetectedAt(parts[5], parts[6]);

                if (lat == null || lng == null || detectedAt == null) continue;
                if (service.exists(lat, lng, detectedAt)) continue;

                Wildfire fire = Wildfire.builder()
                        .latitude(lat)
                        .longitude(lng)
                        .brightness(parseDouble(parts[2]))
                        .confidence(parseInt(parts[8]))
                        .frp(parseDouble(parts[12]))
                        .satellite(parts[7])
                        .detectedAt(detectedAt)
                        .fetchedAt(LocalDateTime.now())
                        .build();

                service.save(fire);
                newCount++;
            }

            log.info("Wildfire fetch: {} new hotspots", newCount);
        } catch (Exception e) {
            log.error("Failed to parse wildfire CSV", e);
        }
    }

    private LocalDateTime parseDetectedAt(String dateStr, String timeStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr, DATE_FMT);
            int hour = Integer.parseInt(timeStr) / 100;
            int minute = Integer.parseInt(timeStr) % 100;
            return LocalDateTime.of(date, LocalTime.of(hour, minute));
        } catch (Exception e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        try { return Double.parseDouble(value.trim()); }
        catch (Exception e) { return null; }
    }

    private Integer parseInt(String value) {
        try { return Integer.parseInt(value.trim()); }
        catch (Exception e) { return null; }
    }
}
