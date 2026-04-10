package com.kmonitor.domain.weather;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_observations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String stationId;

    private String stationName;
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Integer humidity;
    private Double windSpeed;
    private String windDirection;
    private Double precipitation;
    private String condition;

    @Column(nullable = false)
    private LocalDateTime observedAt;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
