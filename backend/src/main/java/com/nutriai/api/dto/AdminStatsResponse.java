package com.nutriai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsResponse {
    @JsonProperty("total_users")
    private Long totalUsers;

    @JsonProperty("total_scans")
    private Long totalScans;

    @JsonProperty("average_calories")
    private Double averageCalories;

    @JsonProperty("top_foods")
    private List<Map<String, Object>> topFoods;

    @JsonProperty("scan_growth")
    private List<Map<String, Object>> scanGrowth;
}
