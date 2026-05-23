package com.nutriai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DailyTrackerResponse {
    private String date;

    @JsonProperty("calories_consumed")
    private Double caloriesConsumed;

    @JsonProperty("calories_goal")
    private Double caloriesGoal;

    @JsonProperty("remaining_calories")
    private Double remainingCalories;

    @JsonProperty("protein_grams")
    private Double proteinGrams;

    @JsonProperty("carbs_grams")
    private Double carbsGrams;

    @JsonProperty("fat_grams")
    private Double fatGrams;

    @JsonProperty("scans_count")
    private Integer scansCount;
}
