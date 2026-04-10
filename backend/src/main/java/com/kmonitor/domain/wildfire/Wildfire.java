package com.kmonitor.domain.wildfire;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wildfires")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wildfire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double latitude;
    private Double longitude;
    private Double brightness;
    private Integer confidence;
    private Double frp;
    private String satellite;

    @Column(nullable = false)
    private LocalDateTime detectedAt;

    @Column(nullable = false)
    private LocalDateTime fetchedAt;
}
