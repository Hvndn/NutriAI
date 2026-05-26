package com.nutriai.api.dto;

import lombok.Data;

@Data
public class HealthLogRequest {
    private Double weight;
    private Integer waterMl;
    private Integer steps;
    private Double sleepHours;
}
