package com.nutriai.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Long id;
    private String email;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("daily_calorie_goal")
    private Integer dailyCalorieGoal;

    @JsonProperty("is_admin")
    private Boolean isAdmin;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
