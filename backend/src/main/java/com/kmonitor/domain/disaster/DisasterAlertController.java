package com.kmonitor.domain.disaster;

import com.kmonitor.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/disasters")
@RequiredArgsConstructor
public class DisasterAlertController {

    private final DisasterAlertService service;

    @GetMapping
    public ApiResponse<List<DisasterAlert>> getAlerts(
            @RequestParam(required = false) LocalDateTime since
    ) {
        List<DisasterAlert> data = since != null
                ? service.getSince(since)
                : service.getRecent();
        return ApiResponse.of(data, data.size());
    }
}
