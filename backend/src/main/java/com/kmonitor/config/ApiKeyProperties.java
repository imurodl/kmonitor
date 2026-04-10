package com.kmonitor.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "kmonitor.api-keys")
public class ApiKeyProperties {
    private String dataGoKr;
    private String firms;
}
