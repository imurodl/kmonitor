package com.kmonitor.domain.wildfire;

import com.kmonitor.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wildfires")
@RequiredArgsConstructor
public class WildfireController {

    private final WildfireService service;

    @GetMapping
    public ApiResponse<List<Wildfire>> getWildfires(
            @RequestParam(defaultValue = "24") int hours
    ) {
        List<Wildfire> data = service.getRecent(hours);
        return ApiResponse.of(data, data.size());
    }
}
