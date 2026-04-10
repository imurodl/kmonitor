package com.kmonitor.domain.airquality;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "air_quality_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirQualityReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String stationName;

    private Double latitude;
    private Double longitude;
    private Integer pm10;
    private Integer pm25;
    private Double o3;
    private Double no2;
    private Double co;
    private Double so2;
    private Integer aqi;
    private String grade;

    @Column(nullable = false)
    private LocalDateTime measuredAt;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
