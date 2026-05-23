package com.nutriai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FoodDetailDto {
    private Long id;

    @JsonProperty("ingredient_name")
    private String ingredientName;

    private String amount;

    @JsonProperty("is_healthy")
    private Boolean isHealthy;
}
