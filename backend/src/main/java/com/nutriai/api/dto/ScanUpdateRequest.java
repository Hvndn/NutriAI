package com.nutriai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScanUpdateRequest {
    @NotBlank(message = "Tên món ăn không được để trống")
    @JsonProperty("food_name")
    private String foodName;

    @Min(value = 0, message = "Calories không được nhỏ hơn 0")
    private Double calories;

    @Min(value = 0, message = "Tinh bột không được nhỏ hơn 0")
    private Double carbs;

    @Min(value = 0, message = "Chất đạm không được nhỏ hơn 0")
    private Double protein;

    @Min(value = 0, message = "Chất béo không được nhỏ hơn 0")
    private Double fat;

    @Min(value = 0, message = "Khối lượng không được nhỏ hơn 0")
    @JsonProperty("weight_grams")
    private Double weightGrams;

    @JsonProperty("health_score")
    private Integer healthScore;

    @JsonProperty("health_advice")
    private String healthAdvice;
}
