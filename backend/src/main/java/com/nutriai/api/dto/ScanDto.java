package com.nutriai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ScanDto {
    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("food_name")
    private String foodName;

    private Double calories;
    private Double carbs;
    private Double protein;
    private Double fat;

    @JsonProperty("weight_grams")
    private Double weightGrams;

    @JsonProperty("health_score")
    private Integer healthScore;

    @JsonProperty("health_advice")
    private String healthAdvice;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    private List<FoodDetailDto> ingredients;
}
