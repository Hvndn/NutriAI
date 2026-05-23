package com.nutriai.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scan_id", nullable = false)
    private Scan scan;

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    private String amount;

    @Column(name = "is_healthy")
    private Boolean isHealthy = true;
}
